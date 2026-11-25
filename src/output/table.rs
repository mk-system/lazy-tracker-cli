use crate::output::style;

/// Cuts `text` to `max` characters, marking the cut with "...".
pub fn truncate(text: &str, max: usize) -> String {
    if text.chars().count() <= max {
        return text.to_owned();
    }
    let kept: String = text.chars().take(max.saturating_sub(3)).collect();
    format!("{kept}...")
}

/// Left-aligned columns separated by two spaces, with a dashed rule under the
/// header. Cells are measured in characters.
pub fn render(headers: &[&str], rows: &[Vec<String>], bold_header: bool) -> String {
    let widths: Vec<usize> = headers
        .iter()
        .enumerate()
        .map(|(i, header)| {
            rows.iter()
                .map(|row| row.get(i).map_or(0, |cell| cell.chars().count()))
                .chain(std::iter::once(header.chars().count()))
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
            let pad = width.saturating_sub(cell.chars().count());
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
}
