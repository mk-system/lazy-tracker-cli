use std::sync::mpsc;
use std::thread;
use std::time::Duration;

use keyring::{Entry, Error as KeyringError};

use crate::auth::store::{ACCOUNT_NAME, TokenStore, parse_stored, serialize};
use crate::auth::token::TokenData;
use crate::error::StoreError;

// An unlock prompt can leave a Secret Service call pending indefinitely.
const TIMEOUT: Duration = Duration::from_secs(30);

const GUIDANCE: &str = "No Secret Service (GNOME Keyring / KWallet) is available to store credentials. Start one, or set LT_INSECURE_TOKEN_FILE=1 to store tokens in a plaintext file (0600).";

pub struct SecretServiceStore {
    service: String,
}

impl SecretServiceStore {
    pub fn new(service: &str) -> Self {
        Self {
            service: service.to_owned(),
        }
    }

    fn with_entry<T: Send + 'static>(
        &self,
        op: impl FnOnce(&Entry) -> Result<T, KeyringError> + Send + 'static,
    ) -> Result<Result<T, KeyringError>, StoreError> {
        let service = self.service.clone();
        let (tx, rx) = mpsc::channel();
        thread::spawn(move || {
            let result = Entry::new(&service, ACCOUNT_NAME).and_then(|entry| op(&entry));
            let _ = tx.send(result);
        });
        rx.recv_timeout(TIMEOUT).map_err(|_| {
            StoreError::Unavailable(format!(
                "Timed out after {}s waiting for the Secret Service. {GUIDANCE}",
                TIMEOUT.as_secs()
            ))
        })
    }
}

fn unavailable(err: KeyringError) -> StoreError {
    StoreError::Unavailable(format!("{GUIDANCE} ({err})"))
}

impl TokenStore for SecretServiceStore {
    fn load(&self) -> Result<Option<TokenData>, StoreError> {
        match self.with_entry(|entry| entry.get_password())? {
            Ok(raw) => parse_stored(&raw).map(Some),
            Err(KeyringError::NoEntry) => Ok(None),
            Err(KeyringError::BadEncoding(_)) => Err(StoreError::Corrupt("not valid UTF-8".into())),
            Err(e) => Err(unavailable(e)),
        }
    }

    fn save(&self, tokens: &TokenData) -> Result<(), StoreError> {
        let value = serialize(tokens);
        self.with_entry(move |entry| entry.set_password(&value))?
            .map_err(unavailable)
    }

    fn clear(&self) -> Result<(), StoreError> {
        match self.with_entry(|entry| entry.delete_credential())? {
            Ok(()) | Err(KeyringError::NoEntry) => Ok(()),
            Err(e) => Err(unavailable(e)),
        }
    }

    fn describe(&self) -> &str {
        "Secret Service"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[ignore = "needs a running Secret Service; run manually on Linux"]
    fn secret_service_round_trip_and_delete() {
        let store = SecretServiceStore::new("lazy-tracker-cli-test");
        let tokens = TokenData {
            access_token: "a".into(),
            refresh_token: "r".into(),
            expires_at: 1,
            refresh_token_expires_at: None,
            scope: "read write".into(),
            api_origin: None,
        };
        let _ = store.clear();
        assert_eq!(store.load().unwrap(), None);
        store.save(&tokens).unwrap();
        assert_eq!(store.load().unwrap(), Some(tokens));
        store.clear().unwrap();
        assert_eq!(store.load().unwrap(), None);
    }
}
