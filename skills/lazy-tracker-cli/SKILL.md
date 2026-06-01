---
name: lazy-tracker-cli
description: Lazy Tracker CLI tool for ticket management and ticket-driven development. Use when managing tickets, updating ticket status, adding comments, or following ticket-driven development workflow with the `lt` command.
---

# Lazy Tracker CLI (`lt`)

Lazy Tracker をターミナルから操作する CLI ツール。チケット管理・チケット駆動開発に使用する。

## セットアップ

### 認証

```bash
lt auth login    # ブラウザで OAuth 認証（初回のみ）
lt auth status   # 認証状態を確認
lt auth logout   # ログアウト
```

### プロジェクト設定

リポジトリルートに `.lazy-tracker.json` を作成する:

```json
{
  "team": "<team-key>",
  "project": "<project-key>"
}
```

team または project のみの指定も可能。省略した値はグローバル設定から取得される。

```bash
# グローバル設定
lt config:set default-team <key>
lt config:set default-project <key>
lt config   # 現在の設定を確認
```

**team/project の解決優先順位:**

1. CLI オプション (`--team`, `--project`)
2. `.lazy-tracker.json`
3. グローバル設定 (`default-team`, `default-project`)

## コマンドリファレンス

### チケット

```bash
# 一覧取得
lt tickets list
lt tickets list --state started
lt tickets list --list-type current_backlog
lt tickets list --team <key> --project <key>

# 詳細取得
lt tickets show <ticket-id-or-number>

# 作成
lt tickets create --title "タイトル"
lt tickets create --title "タイトル" --description "説明" --state started --point 3

# 更新
lt tickets update <ticket-id-or-number> --state started
lt tickets update <ticket-id-or-number> --title "新タイトル" --point 5
lt tickets update <ticket-id-or-number> --point null   # ポイントをクリア

# 削除
lt tickets delete <ticket-id-or-number>
lt tickets delete <ticket-id-or-number> --force   # 確認スキップ
```

**チケットの識別子:** UUID またはチケット番号（数字のみ）。チケット番号を使う場合は team/project の設定が必要。

**state の値:** `unscheduled`, `created`, `started`, `finished`, `delivered`, `accepted`, `rejected`
**list-type の値:** `done`, `current_backlog`, `icebox`
**type の値:** `normal`, `release`

**tickets create のデフォルト値:**

- state: `created`
- list-type: `current_backlog`
- type: `normal`

### コメント

```bash
# チケットのコメント一覧
lt comments list <ticket-id>

# コメント追加
lt comments add <ticket-id> -m "コメント内容"

# コメント更新
lt comments update <chat-id> -m "更新内容"

# コメント削除
lt comments delete <chat-id>
lt comments delete <chat-id> --force
```

### 出力形式

全コマンドはデフォルトで **JSON** を出力する。

```bash
lt tickets list                                       # JSON 出力
lt tickets list --table                               # テーブル表示
lt tickets list --table --columns ticketNumber,title,state  # カラム指定
```

利用可能なカラム: `id`, `ticketNumber`, `title`, `state`, `listType`, `point`, `projectKey`, `teamKey`, `ticketType`

### スキル管理

コーディングエージェントに本スキルをインストールする。対応エージェント: `claude-code`, `codex`, `copilot`, `cursor`

```bash
# スキルの内容を表示
lt skills

# 対話形式（エージェント・インストール先を選択）
lt skills install

# user スコープにインストール（デフォルト: ~/.<agent>/skills/...）
lt skills install --agent claude-code

# project スコープにインストール（git root 配下）
lt skills install --agent claude-code --project

# カスタムパスにインストール
lt skills install --agent claude-code --dir /path/to/dir

# インストール内容を事前確認
lt skills install --agent claude-code --dry-run

# アンインストール（user スコープ）
lt skills uninstall --agent claude-code

# project スコープからアンインストール
lt skills uninstall --agent claude-code --project

# アンインストール内容を事前確認
lt skills uninstall --agent claude-code --dry-run
```

**スコープ:**

- **user**（デフォルト）: `~/<skillsDir>/lazy-tracker-cli/SKILL.md` — 全プロジェクトで共有
- **project**: `<git root>/<skillsDir>/lazy-tracker-cli/SKILL.md` — リポジトリ固有

### グローバルオプション

```bash
lt --api-url <url> <command>   # API URL を上書き
lt --no-color <command>        # カラー出力を無効化
```

環境変数 `LT_API_URL` でも API URL を指定可能。

## チケット駆動開発ワークフロー

### 1. 作業対象のチケットを確認する

```bash
lt tickets list --state created --list-type current_backlog
lt tickets show <ticket-number>
```

### 2. 作業を開始する

```bash
lt tickets update <ticket-number> --state started
```

### 3. 作業中に進捗をコメントする

```bash
lt comments add <ticket-id> -m "実装方針: ..."
```

### 4. 作業を完了する

```bash
lt tickets update <ticket-number> --state finished
lt comments add <ticket-id> -m "完了: 変更内容のサマリ"
```

### 5. レビュー中に発見した問題を別チケットとして発行する

PR レビュー中に本題とは別の問題を発見した場合、修正をそのPRに混ぜず、別チケットとして切り出す。

```bash
# PR のレビュー内容を確認
gh pr view <pr-number>
gh pr diff <pr-number>

# 発見した問題を新規チケットとして発行
lt tickets create --title "レビューで発見: <問題の概要>" --description "PR #<pr-number> のレビュー中に発見。\n\n<問題の詳細>"

# 必要に応じて PR にコメントで別チケット化した旨を残す
gh pr comment <pr-number> --body "この問題は別チケット <ticket-number> として切り出しました"
```

### 6. PR マージ後にチケットを完了にする

PR がマージされたら、対応するチケットの state を更新する。

```bash
# PR のマージ状態を確認
gh pr view <pr-number> --json state,mergedAt

# マージ済みならチケットを完了にする
lt tickets update <ticket-number> --state finished
lt comments add <ticket-id> -m "PR #<pr-number> がマージされたため完了"
```

### 7. 未完了チケットのマージ状況を確認する

started のままのチケットが、実は GitHub 上でマージ済みになっていないかを確認する。

```bash
# 未完了のチケットを取得
lt tickets list --state started

# 各チケットに対応するブランチやPRがマージ済みか確認
gh pr list --state merged --search "<ticket-number>"

# マージ済みなのに未完了のチケットがあれば更新する
lt tickets update <ticket-number> --state finished
lt comments add <ticket-id> -m "PR #<pr-number> は既にマージ済み。チケットを完了に更新"
```

### 8. `.lazy-tracker.json` の管理

プロジェクトのリポジトリに `.lazy-tracker.json` がない場合は作成してよい:

```json
{
  "team": "<team-key>",
  "project": "<project-key>"
}
```

これにより、毎回 `--team` / `--project` を指定する必要がなくなる。
