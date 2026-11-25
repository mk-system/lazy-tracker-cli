use std::sync::Mutex;

use crate::auth::store::TokenStore;
use crate::auth::token::TokenData;
use crate::error::StoreError;

#[derive(Default)]
pub struct MemoryStore {
    tokens: Mutex<Option<TokenData>>,
    unavailable: bool,
}

impl MemoryStore {
    pub fn with(tokens: TokenData) -> Self {
        Self {
            tokens: Mutex::new(Some(tokens)),
            unavailable: false,
        }
    }

    pub fn unavailable() -> Self {
        Self {
            tokens: Mutex::new(None),
            unavailable: true,
        }
    }

    pub fn current(&self) -> Option<TokenData> {
        self.tokens.lock().unwrap().clone()
    }

    fn check(&self) -> Result<(), StoreError> {
        if self.unavailable {
            Err(StoreError::Unavailable("store is locked".into()))
        } else {
            Ok(())
        }
    }
}

impl TokenStore for MemoryStore {
    fn load(&self) -> Result<Option<TokenData>, StoreError> {
        self.check()?;
        Ok(self.current())
    }

    fn save(&self, tokens: &TokenData) -> Result<(), StoreError> {
        self.check()?;
        *self.tokens.lock().unwrap() = Some(tokens.clone());
        Ok(())
    }

    fn clear(&self) -> Result<(), StoreError> {
        self.check()?;
        *self.tokens.lock().unwrap() = None;
        Ok(())
    }

    fn describe(&self) -> &str {
        "memory"
    }
}
