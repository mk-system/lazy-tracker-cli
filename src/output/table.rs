use unicode_width::{UnicodeWidthChar, UnicodeWidthStr};

use crate::output::style;

pub fn truncate(text: &str, max: usize) -> String {
    if text.width() <= max {
        return text.to_owned();
    }
    let budget = max.saturating_sub(3);
    let mut used = 0;
    let kept: String = text
        .chars()
        .take_while(|c| {
            used += c.width().unwrap_or(0);
            used <= budget
        })
        .collect();
    format!("{kept}...")
}

pub fn render(headers: &[&str], rows: &[Vec<String>], bold_header: bool) -> String {
    let rows: Vec<Vec<String>> = rows
        .iter()
        .map(|row| row.iter().map(|cell| style::strip_controls(cell)).collect())
        .collect();
    let widths: Vec<usize> = headers
        .iter()
        .enumerate()
        .map(|(i, header)| {
            rows.iter()
                .map(|row| row.get(i).map_or(0, |cell| cell.width()))
                .chain(std::iter::once(header.width()))
                .max()
                .unwrap_or(0)
        })
        .collect();

    let header = join_padded(headers.iter().copied(), &widths);
    let header = if bold_header {
        style::bold(&header)
    } else {
        header
    };
    let rule = widths
        .iter()
        .map(|w| "-".repeat(*w))
        .collect::<Vec<_>>()
        .join("  ");

    let mut lines = vec![header, rule];
    lines.extend(
        rows.iter()
            .map(|row| join_padded(row.iter().map(String::as_str), &widths)),
    );
    lines.join("\n")
}

fn join_padded<'a>(cells: impl Iterator<Item = &'a str>, widths: &[usize]) -> String {
    cells
        .zip(widths)
        .map(|(cell, width)| {
            let pad = width.saturating_sub(cell.width());
            format!("{cell}{}", " ".repeat(pad))
        })
        .collect::<Vec<_>>()
        .join("  ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn truncate_leaves_short_text_untouched() {
        assert_eq!(truncate("short", 10), "short");
    }

    #[test]
    fn truncate_marks_cut_text_with_an_ellipsis_within_the_limit() {
        assert_eq!(truncate("abcdefghij", 8), "abcde...");
    }

    #[test]
    fn render_pads_columns_to_the_widest_cell_and_underlines_the_header() {
        let rows = vec![
            vec!["1".to_owned(), "Fix login".to_owned()],
            vec!["12".to_owned(), "Doc".to_owned()],
        ];
        let rendered = render(&["#", "Title"], &rows, false);

        assert_eq!(
            rendered,
            "#   Title    \n--  ---------\n1   Fix login\n12  Doc      "
        );
    }

    #[test]
    fn render_aligns_columns_after_wide_characters() {
        let rows = vec![
            vec!["オフィス".to_owned(), "10".to_owned()],
            vec!["forge".to_owned(), "2".to_owned()],
        ];
        let rendered = render(&["Name", "V"], &rows, false);

        assert_eq!(
            rendered,
            "Name      V \n--------  --\nオフィス  10\nforge     2 "
        );
    }

    #[test]
    fn truncate_counts_wide_characters_as_two_columns() {
        let cut = truncate("オフィスのレイアウト", 9);

        assert_eq!(cut, "オフィ...");
        assert!(cut.width() <= 9);
    }

    #[test]
    fn render_replaces_control_characters_in_cells() {
        let rows = vec![vec!["a\u{1b}]0;x\u{7}b".to_owned()]];
        let rendered = render(&["T"], &rows, false);

        assert!(!rendered.contains('\u{1b}'));
        assert!(!rendered.contains('\u{7}'));
        assert!(rendered.ends_with("a?]0;x?b"));
    }
}
