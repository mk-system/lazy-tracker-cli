# Lazy Tracker CLI

Lazy Tracker をターミナルから操作するためのCLI

## インストール

### シングルバイナリ（推奨）

[Releases](https://github.com/mk-system/lazy-tracker-cli/releases) からプラットフォームに合ったバイナリをダウンロード:

```bash
# macOS (Apple Silicon)
curl -L https://github.com/mk-system/lazy-tracker-cli/releases/latest/download/lt-macos-arm64 -o lt
chmod +x lt
sudo mv lt /usr/local/bin/

# macOS (Intel)
curl -L https://github.com/mk-system/lazy-tracker-cli/releases/latest/download/lt-macos-x64 -o lt
chmod +x lt
sudo mv lt /usr/local/bin/

# Linux (x64)
curl -L https://github.com/mk-system/lazy-tracker-cli/releases/latest/download/lt-linux-x64 -o lt
chmod +x lt
sudo mv lt /usr/local/bin/

# Linux (arm64)
curl -L https://github.com/mk-system/lazy-tracker-cli/releases/latest/download/lt-linux-arm64 -o lt
chmod +x lt
sudo mv lt /usr/local/bin/
```

Linux 版は musl の静的リンクバイナリで、glibc のバージョンに依存しない。**Windows はサポートしない**（v0.2.0 以降は配布物に含まれない）。

#### チェックサムの検証

各リリースには `SHA256SUMS` が添付されている。ダウンロードしたバイナリと同じディレクトリで検証する:

```bash
curl -LO https://github.com/mk-system/lazy-tracker-cli/releases/latest/download/SHA256SUMS
shasum -a 256 -c SHA256SUMS --ignore-missing
```

`--ignore-missing` で、ダウンロードしていない他プラットフォームのバイナリを無視する。上の手順で `lt` にリネームした場合は、リネーム前のファイル名で検証すること。

各バイナリには GitHub Actions でビルドしたことを示す来歴証明（build provenance attestation）も付いている。GitHub CLI で検証できる:

```bash
gh attestation verify lt-macos-arm64 --repo mk-system/lazy-tracker-cli
```

### ソースからビルド

Rust のツールチェーン（[rustup](https://rustup.rs/)）が必要。バージョンは `rust-toolchain.toml` で固定されており、rustup が自動で導入する。

```bash
git clone https://github.com/mk-system/lazy-tracker-cli.git
cd lazy-tracker-cli
cargo build --release --locked
sudo cp target/release/lt /usr/local/bin/
```

## セットアップ

### 認証

```bash
lt auth login
```

上記コマンドを実行後、ブラウザが自動的に開き、認証フローが開始される。

ブラウザを開けない環境（SSH 先や headless な Linux など）では警告だけが表示されるので、表示された URL を手元のブラウザで開いてデバイスコードを入力する。

### 認証情報の保存場所

| OS    | 保存先                                                                     |
| ----- | -------------------------------------------------------------------------- |
| macOS | Keychain（service `lazy-tracker-cli`、account `tokens`）                   |
| Linux | Secret Service（GNOME Keyring / KWallet など）。同じ service / account 名 |

Linux で Secret Service が動いていない環境（サーバー、コンテナ、CI など）では `lt auth login` がエラーで止まる。その場合、環境変数 `LT_INSECURE_TOKEN_FILE=1` を設定すると、トークンを設定ディレクトリの `tokens.json` に**平文で**（パーミッション 0600）保存する。他のユーザーが読み書きできる状態の `tokens.json` は読まずにエラーにする。この変数は macOS でも有効で、設定すると Keychain の代わりにファイルを使う。平文保存では共有マシンでのアカウント保護に注意すること。ログアウト (`lt auth logout`) でトークンは削除される。

`lt auth status` で現在の保存先を確認できる。

v0.1.x（Bun 版）からの移行: macOS の Keychain の項目はそのまま読めるので再ログインは不要。v0.1.x の設定ファイル（macOS `~/Library/Preferences/lazy-tracker-cli-nodejs/config.json`、Linux `~/.config/lazy-tracker-cli-nodejs/config.json`）は初回実行時に新しい設定ファイルへ引き継がれ、そこに残っていた平文トークンは保存先へ移したうえで削除される。

### 設定ファイルの場所

`~/.config/lazy-tracker-cli/config.json`（macOS / Linux 共通。`XDG_CONFIG_HOME` が設定されていれば `$XDG_CONFIG_HOME/lazy-tracker-cli/config.json`）。

### プロジェクト設定

リポジトリルートに `.lazy-tracker.json` を作成する。

```json
{
  "team": "your-team-key",
  "project": "your-project-key"
}
```

team または project のみの指定も可能

```json
{ "project": "frontend" }
```

この場合、team はグローバル設定の `default-team` から取得される。

### グローバル設定

```bash
# デフォルトのチームを設定
lt config:set default-team my-team

# デフォルトのプロジェクトを設定
lt config:set default-project my-project

# 設定確認
lt config
```

### team/project の解決優先順位

1. CLI オプション (`--team`, `--project`)
2. `.lazy-tracker.json` ファイル
3. グローバル設定 (`default-team`, `default-project`)

各ソースから team/project を個別に取得してマージする。例えば、グローバルに `default-team` を設定し、`.lazy-tracker.json` で `project` のみ指定すると、両方が組み合わされる。

`.lazy-tracker.json` は、カレントディレクトリから上へ向かって git リポジトリのルートまで探す（リポジトリの外ではホームディレクトリまで）。リポジトリより上の階層にあるファイルは、勝手には読まない。複数のリポジトリで 1 つのファイルを共有したい場合は、環境変数 `LT_PROJECT_FILE` でそのファイルのパスを指定する。ファイルが壊れている（JSON として読めない、`team` / `project` が文字列でない、通常のファイルでない、64 KiB を超える）場合はエラーになるので、修正するか削除する。チケット番号で操作するときや `tickets create` で、team/project を `.lazy-tracker.json` から決めた場合は、使ったファイルのパスを stderr に表示する。

## 使い方

### 出力形式

全コマンドはデフォルトで JSON 形式で出力する。`--table` オプションを使用するとテーブル形式で表示できる。

### チケット

```bash
# 一覧（JSON 出力）
lt tickets list

# テーブル表示
lt tickets list --table

# カラム指定
lt tickets list --table --columns ticketNumber,title,state,teamKey

# state でフィルタ
lt tickets list --state started

# list-type でフィルタ
lt tickets list --list-type current_backlog

# 作成
lt tickets create --title "タイトル"

# 作成（オプション指定）
lt tickets create --title "タイトル" --state unscheduled --list-type icebox

# 詳細
lt tickets show <ticket-id>

# 更新
lt tickets update <ticket-id> --state started

# 削除
lt tickets delete <ticket-id>

# 削除（確認スキップ）
lt tickets delete <ticket-id> --force
```

削除の確認プロンプトは端末からの入力を前提とする。stdin が端末でない（パイプ・エージェントからの実行など）場合は `--force` を付けないとエラーで終了する（`comments delete` / `skills uninstall` も同じ）。

#### tickets list オプション

| オプション            | 説明                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------- |
| `-t, --team <key>`    | チームでフィルタ                                                                        |
| `-p, --project <key>` | プロジェクトでフィルタ                                                                  |
| `-s, --state <state>` | 状態でフィルタ (unscheduled, created, started, finished, delivered, accepted, rejected) |
| `--list-type <type>`  | リストタイプでフィルタ (done, current_backlog, icebox)                                  |
| `--table`             | テーブル形式で表示                                                                      |
| `--columns <cols>`    | 表示カラム (カンマ区切り)                                                               |

利用可能なカラム: `id`, `ticketNumber`, `title`, `state`, `listType`, `point`, `projectKey`, `teamKey`, `ticketType`

#### tickets create オプション

| オプション                 | 説明                                         | デフォルト      |
| -------------------------- | -------------------------------------------- | --------------- |
| `--title <title>`          | タイトル（必須）                             | -               |
| `-d, --description <text>` | 説明                                         | 空文字          |
| `--type <type>`            | チケットタイプ (normal, release)             | normal          |
| `--state <state>`          | 初期状態 (unscheduled, created, started)     | created         |
| `--list-type <type>`       | リストタイプ (done, current_backlog, icebox) | current_backlog |
| `--point <points>`         | ストーリーポイント                           | -               |
| `--release-date <date>`    | リリース日 (YYYY-MM-DD)                      | -               |

### コメント

```bash
# 一覧
lt comments list <ticket-id>

# 一覧（チケット番号で指定）
lt comments list 213 --team mk-system --project lazy-tracker

# 追加
lt comments add <ticket-id> -m "コメント内容"

# 追加（チケット番号で指定）
lt comments add 213 -m "コメント内容" --team mk-system --project lazy-tracker

# 更新
lt comments update <chat-id> -m "更新内容"

# 削除
lt comments delete <chat-id>

# 削除（確認スキップ）
lt comments delete <chat-id> --force
```

`list` / `add` はチケット ID (UUID) のほかにチケット番号も受け付ける。チケット番号はプロジェクト内でのみ一意なため、`--team` / `--project` または `.lazy-tracker.json` による team/project の解決が必要になる。`update` / `delete` はチケットではなくコメント ID (`<chat-id>`) を対象とするため、番号指定はできない。

### スキル（コーディングエージェント連携）

`lt skills` コマンドで、コーディングエージェント（Claude Code, Codex, Copilot, Cursor）に `lt` を利用したチケット管理のスキルをインストールすることができる。具体的には、コマンドの使い方やチケット駆動開発のワークフローを理解できるようになる。

```bash
# スキルの内容を表示
lt skills

# 対話形式でインストール（エージェント・スコープを選択）
lt skills install

# user スコープにインストール（デフォルト）
lt skills install --agent claude-code

# project スコープにインストール（git root 配下）
lt skills install --agent claude-code --project

# カスタムパスにインストール
lt skills install --agent claude-code --dir /path/to/dir

# インストール内容を事前確認
lt skills install --agent claude-code --dry-run

# アンインストール
lt skills uninstall --agent claude-code

# アンインストール内容を事前確認
lt skills uninstall --agent claude-code --dry-run
```

**スコープ:**

| スコープ  | インストール先                                     | 用途                               |
| --------- | -------------------------------------------------- | ---------------------------------- |
| `user`    | `~/<skillsDir>/lazy-tracker-cli/SKILL.md`          | 全プロジェクトで共有（デフォルト） |
| `project` | `<git root>/<skillsDir>/lazy-tracker-cli/SKILL.md` | リポジトリ固有                     |

エージェントごとの `<skillsDir>`:

| エージェント  | skillsDir        |
| ------------- | ---------------- |
| `claude-code` | `.claude/skills` |
| `codex`       | `.agents/skills` |
| `copilot`     | `.agents/skills` |
| `cursor`      | `.agents/skills` |

### その他

```bash
# 認証状態
lt auth status

# ログアウト
lt auth logout

# 設定確認
lt config

# 設定変更
lt config:set <key> <value>
```

## オプション

```bash
# API URL を指定（デフォルト: https://api.lazy-tracker.com、この実行1回限り。恒久的に変更したい場合は
# `lt config:set api-url` を使う）
lt --api-url https://example.com tickets list

# カラー出力を無効化
lt --no-color tickets list

# 診断ログを出力（リクエストの method / URL / ステータス / 所要時間、
# エラーレスポンスのボディ、エラーの原因）
lt --verbose comments list <ticket-id>
```

API URL の解決順は `--api-url` > `lt config:set api-url` > `LT_API_URL` > 既定値。どの経路でも `https://` のみ受け付ける（ローカル開発用に `localhost` / `127.0.0.1` / `::1` だけは `http://` も可）。

ログイン中のトークンは、発行した API と同じ origin にしか送らない。別の API URL を指定するとエラーになり、保存済みのトークンはそのまま残る。その API を使うなら `lt auth login --force` でログインし直す（保存済みのログインは置き換わる）。v0.1.x から引き継いだログインは発行元を記録していないため、既定の API と `lt config:set api-url` で設定した API にだけ送る。

### `--verbose` について

診断ログはすべて **stderr** に出力される。stdout は JSON のままなので、
`lt --verbose tickets list 2>/dev/null | jq .` のようにパイプしても壊れない。

Authorization ヘッダ・アクセストークン・リフレッシュトークンはログに出力しない。
OAuth トークンエンドポイントについては method / URL / ステータスのみを記録し、
リクエスト・レスポンスのボディは記録しない。

出力例:

```console
$ lt --verbose comments list 00000000-0000-0000-0000-000000000000
[debug] → GET https://api.lazy-tracker.com/api/v1/tickets/00000000-.../chats
[debug] ← 404 GET https://api.lazy-tracker.com/api/v1/tickets/00000000-.../chats (212ms)
[debug] response body: {"status":"error","errorCode":"NOT_FOUND","details":null,"exceptionInfo":null}
✗ Failed to fetch comments
Request failed with status 404
  status: 404
  response: {"status":"error","errorCode":"NOT_FOUND","details":null,"exceptionInfo":null}
```

通信エラーなど原因が連鎖している場合は `caused by: ...` の行が続く。

## 環境変数

| 変数名                   | 説明                                                                | デフォルト                     |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------ |
| `LT_API_URL`             | API URL（`config:set api-url` より優先度が低い）                    | `https://api.lazy-tracker.com` |
| `LT_INSECURE_TOKEN_FILE` | `1` でトークンを平文ファイル（0600）に保存する                      | 未設定                         |
| `LT_PROJECT_FILE`        | 使う `.lazy-tracker.json` のパス（リポジトリの外にあるファイルを使う場合） | 未設定                         |
| `LT_NO_BROWSER`          | `1` で `lt auth login` がブラウザを開かず、認可 URL の表示だけにする | 未設定                         |
| `LT_CONFIG_DIR`          | 設定ディレクトリを上書きする（主にテスト用。旧設定の移行も行わない。誰でも書き込めるディレクトリは拒否する） | `~/.config/lazy-tracker-cli`   |
| `NO_COLOR`               | 設定するとカラー出力を無効化する                                    | 未設定                         |

## 開発

Rust（バージョンは `rust-toolchain.toml` で固定）を使用。

```bash
# 開発実行
cargo run -- --verbose tickets list

# テスト（実ユーザーの Keychain・設定ディレクトリには触れない）
cargo test

# Lint / Format（CI と同じ）
cargo fmt --all --check
cargo clippy --all-targets --locked -- -D warnings

# リリースビルド
cargo build --release --locked
```

Keychain / Secret Service を実際に読み書きするテストは `#[ignore]` 付きで、使い捨ての項目名（`lazy-tracker-cli-test`）を使う。手動で確認する場合のみ `cargo test -- --ignored` で実行する。
