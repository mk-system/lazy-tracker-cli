//! Response key conversion with the same rules as `humps.camelizeKeys` (2.0.1),
//! which produced the JSON shape that agents read from the Bun release.

use serde_json::{Map, Value};

pub fn camelize_keys(value: Value) -> Value {
    match value {
        Value::Object(map) => Value::Object(
            map.into_iter()
                .map(|(key, inner)| (camelize(&key), camelize_keys(inner)))
                .collect::<Map<_, _>>(),
        ),
        Value::Array(items) => Value::Array(items.into_iter().map(camelize_keys).collect()),
        other => other,
    }
}

/// `[-_\s]+(.)?` becomes the next character upper-cased, then the first
/// character is lower-cased. Keys that read as numbers are left alone.
pub fn camelize(key: &str) -> String {
    if is_numerical(key) {
        return key.to_owned();
    }
    let mut converted = String::with_capacity(key.len());
    let mut chars = key.chars().peekable();
    while let Some(c) = chars.next() {
        if is_separator(c) {
            while chars.peek().copied().is_some_and(is_separator) {
                chars.next();
            }
            if let Some(next) = chars.next() {
                converted.extend(next.to_uppercase());
            }
        } else {
            converted.push(c);
        }
    }
    let mut chars = converted.chars();
    match chars.next() {
        Some(first) => first.to_lowercase().chain(chars).collect(),
        None => converted,
    }
}

fn is_separator(c: char) -> bool {
    c == '-' || c == '_' || c.is_whitespace()
}

/// Mirrors humps' `obj - 0 === obj - 0`, i.e. JavaScript's string-to-number
/// conversion succeeding (an empty or blank string counts as 0).
fn is_numerical(key: &str) -> bool {
    let trimmed = key.trim();
    if trimmed.is_empty() {
        return true;
    }
    let radix_digits = |prefix: [&str; 2], radix: u32| {
        prefix
            .iter()
            .find_map(|p| trimmed.strip_prefix(p))
            .is_some_and(|digits| !digits.is_empty() && digits.chars().all(|c| c.is_digit(radix)))
    };
    if radix_digits(["0x", "0X"], 16)
        || radix_digits(["0o", "0O"], 8)
        || radix_digits(["0b", "0B"], 2)
    {
        return true;
    }
    let unsigned = trimmed
        .strip_prefix('+')
        .or_else(|| trimmed.strip_prefix('-'))
        .unwrap_or(trimmed);
    unsigned == "Infinity" || is_decimal_literal(unsigned)
}

fn is_decimal_literal(s: &str) -> bool {
    let (mantissa, exponent) = match s.find(['e', 'E']) {
        Some(i) => (&s[..i], Some(&s[i + 1..])),
        None => (s, None),
    };
    let (int_part, frac_part) = match mantissa.split_once('.') {
        Some((i, f)) => (i, f),
        None => (mantissa, ""),
    };
    let digits = |p: &str| p.chars().all(|c| c.is_ascii_digit());
    let mantissa_ok =
        digits(int_part) && digits(frac_part) && !(int_part.is_empty() && frac_part.is_empty());
    let exponent_ok = exponent.is_none_or(|e| {
        let e = e.strip_prefix(['+', '-']).unwrap_or(e);
        !e.is_empty() && digits(e)
    });
    mantissa_ok && exponent_ok
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn snake_case_keys_become_camel_case() {
        assert_eq!(camelize("ticket_number"), "ticketNumber");
        assert_eq!(
            camelize("refresh_token_expires_in"),
            "refreshTokenExpiresIn"
        );
    }

    #[test]
    fn dashes_spaces_and_repeated_separators_are_collapsed() {
        assert_eq!(camelize("list-type"), "listType");
        assert_eq!(camelize("a__b  c"), "aBC");
        assert_eq!(camelize("trailing_"), "trailing");
    }

    #[test]
    fn the_first_character_is_lower_cased() {
        assert_eq!(camelize("TeamKey"), "teamKey");
        assert_eq!(camelize("_private"), "private");
    }

    #[test]
    fn numeric_keys_are_left_unchanged() {
        for key in ["1", "12_3", "1.5", "-2", "1e3", "0x1F", " 7 ", ""] {
            let expected = if key == "12_3" { "123" } else { key };
            assert_eq!(camelize(key), expected, "key {key:?}");
        }
    }

    #[test]
    fn nested_objects_and_arrays_are_converted_recursively_in_order() {
        let input = json!({
            "ticket_number": 1,
            "assignees": [{"display_name": "a"}],
            "meta": {"created_at": 2, "by_state": {"3": "x"}}
        });
        let converted = camelize_keys(input);

        assert_eq!(
            converted,
            json!({
                "ticketNumber": 1,
                "assignees": [{"displayName": "a"}],
                "meta": {"createdAt": 2, "byState": {"3": "x"}}
            })
        );
        let keys: Vec<_> = converted.as_object().unwrap().keys().cloned().collect();
        assert_eq!(keys, ["ticketNumber", "assignees", "meta"]);
    }
}
