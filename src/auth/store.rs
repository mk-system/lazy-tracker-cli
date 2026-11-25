pub mod file;
#[cfg(target_os = "macos")]
pub mod keychain;
#[cfg(test)]
pub mod memory;
#[cfg(target_os = "linux")]
pub mod secret_service;

use std::path::Path;

use crate::auth::token::TokenData;
use crate::error::StoreError;

pub const SERVICE_NAME: &str = "lazy-tracker-cli";
pub const ACCOUNT_NAME: &str = "tokens";

pub trait TokenStore: Send + Sync {
    /// `Ok(None)` only when the store positively reports that no credentials
    /// exist. Any failure to read is an error, never "not logged in".
    fn load(&self) -> Result<Option<TokenData>, StoreError>;
    fn save(&self, tokens: &TokenData) -> Result<(), StoreError>;
    fn clear(&self) -> Result<(), StoreError>;
    fn describe(&self) -> &str;
}

pub fn select(insecure_file: bool, config_dir: &Path) -> Box<dyn TokenStore> {
    if insecure_file {
        return Box::new(file::FileStore::new(config_dir.join("tokens.json")));
    }
    #[cfg(target_os = "macos")]
    {
        Box::new(keychain::KeychainStore::new(SERVICE_NAME))
    }
    #[cfg(target_os = "linux")]
    {
        Box::new(secret_service::SecretServiceStore::new(SERVICE_NAME))
    }
}

pub fn parse_stored(raw: &str) -> Result<TokenData, StoreError> {
    serde_json::from_str(raw).map_err(|e| StoreError::Corrupt(e.to_string()))
}

pub fn serialize(tokens: &TokenData) -> String {
    serde_json::to_string(tokens).expect("TokenData always serializes")
}
