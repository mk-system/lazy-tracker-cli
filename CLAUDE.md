# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

Lazy Tracker（mk-system のプロジェクト管理 SaaS）をターミナルから操作する CLI `lt`．Rust + clap 製で，macOS（arm64 / x64）と Linux（x64 / arm64，musl 静的リンク）のバイナリを GitHub Releases で配布する．Windows は非サポート（`src/main.rs` の `compile_error!`）．認可・永続化はバックエンド API（既定 `https://api.lazy-tracker.com`）側にあり，本リポジトリは HTTP クライアントに徹する．

**OSS として公開されており**，リリースバイナリは mk-system 外の顧客にも配布される．外部 fork からの PR を前提に，依存追加・ビルドスクリプト（`build.rs`）・CI トリガー（`pull_request_target` 化など）・`skills/` 配下の変更は慎重に扱うこと．セキュリティ上の前提と severity 判断は `.github/review-pr/repo-context.md` にまとまっている（ただし TS / Bun 時代の記述が残っている）．

## コマンド

ツールチェーンは `rust-toolchain.toml` で固定（rustup が自動導入）．

```sh
cargo run -- <args>                  # 例: cargo run -- --verbose tickets list
cargo test                           # 全テスト（ユニット + tests/cli.rs）
cargo test --test cli                # 統合テストのみ
cargo test <テスト名の一部>          # 名前で絞り込み
cargo test -- --ignored              # 実 Keychain / Secret Service を触る手動テスト（使い捨て項目名）
cargo fmt --all --check              # CI と同じ（整形は cargo fmt --all）
cargo clippy --all-targets --locked -- -D warnings
cargo build --release --locked       # target/release/lt
```

CI（`.github/workflows/ci.yaml`）は ubuntu / macOS で fmt → clippy → test → release build の順に実行する．pre-commit フックは置いていないので，コミット前に上の fmt / clippy / test を手元で通すこと．Linux 専用コード（`src/auth/store/secret_service.rs`）は macOS ではコンパイルされないので，触ったら Linux（Docker の `rust:<toolchain の版>` イメージなど）で clippy / test を通す．

## アーキテクチャ

- **エントリ**: `src/main.rs` が `Cli::parse()`（`src/cli.rs` に clap derive の全定義．グローバルオプション `--api-url` / `--no-color` / `--verbose` は `global = true`）→ `Context::new` → `commands::run`．各グループは `src/commands/<group>.rs`．`config:set` は `#[command(name = "config:set")]`．
- **Context**（`src/context.rs`）: 環境変数は `main` で `Env::from_process()` が一度だけ読み，`Context` に詰める．他のモジュールは `std::env` を読まない（edition 2024 では `set_var` が unsafe で，テストから環境を差し替えられないため）．グローバル可変状態は持たない．
- **API クライアント**（`src/api/`）: 16 operation を `endpoints.rs` に手書きしている（OpenAPI からの生成はしない）．レスポンスは `serde_json::Value` のまま `case.rs` でキーを再帰的に camelize して出力する（`humps` 2.0.1 互換．型付き struct にするとサーバーが足したフィールドが消え，stdout の契約が変わる）．`serde_json` の `preserve_order` でキー順はサーバーどおり．リクエストボディは snake_case の struct から直接組む．`client.rs` の `call` が:
  - 非 2xx を `CliError::Api{status, body}`（メッセージはボディの `message` → `error` → `Request failed with status N`），通信失敗を `Network` に変換．
  - 401 を受けたら 1 回だけリフレッシュして再送する．再送も 401 ならエラーにするが**トークンは破棄しない**．
  - パスセグメントは `url` で percent-encode．接続 10 秒 / 全体 30 秒のタイムアウト，`User-Agent: lt/<version>`．
- **認証**（`src/auth/`）: OAuth 2.0 Device Authorization Grant（`device_flow.rs`，public client で secret なし，`slow_down` は以後の間隔に累積）．
  - `session.rs`: 期限切れ（60 秒前倒し）ならリフレッシュ．リフレッシュとトークンの書き換え（login / logout）はすべて `<config_dir>/auth.lock` の排他ロック（`std::fs::File::lock`）の中で行い，ロック取得後に再読込して他プロセスの更新を再利用する（リフレッシュトークンのローテーション競合対策）．
  - トークンを破棄するのはリフレッシュが **401 または 400 `invalid_grant`** のときだけ．429 / 5xx / 通信失敗 / その他の 4xx では保持する（その他の 4xx と「再送も 401」の案内は `lt auth login --force`）．
  - トークンは発行元 API の origin（`TokenData.api_origin`）を持ち，別 origin の API URL には送らない（`session::ensure_issued_here`．不一致でもトークンは消さない．origin の無い旧データは受け入れる）．
  - 保存先は `TokenStore` trait（`store.rs`）．`LT_INSECURE_TOKEN_FILE=1` → `FileStore`（`tokens.json`，0600），macOS → `KeychainStore`，Linux → `SecretServiceStore`．`Ok(None)` は「確実に項目が無い」ときだけで，読めなかったら必ず `StoreError::Unavailable`（未ログイン扱いにしない）．
  - Keychain は `/usr/bin/security` を絶対パスで起動する（Security.framework を直接呼ぶと，ad-hoc 署名のリリースごとに ACL の許可ダイアログが出るため）．exit 44 = 項目なし．書き込みは `-U` の上書きのみで，値は `security -i` の stdin で渡す．`security -i` は 4096 バイトで行を分割して**途中までの値を保存してしまう**ので，行が長すぎる・制御文字を含む場合だけ argv にフォールバックする（`plan_write`）．タイムアウト 30 秒．
  - Secret Service は `keyring`（`v1` feature．Linux では zbus ストアのみ有効，pure Rust で OpenSSL / tokio なし）．ワーカースレッドで呼んで 30 秒で打ち切る．keyutils へのフォールバックはしない．
- **設定の解決**（`src/config/`）:
  - 設定ディレクトリ: `LT_CONFIG_DIR` > `$XDG_CONFIG_HOME/lazy-tracker-cli` > `~/.config/lazy-tracker-cli`（macOS も同じ）．`config.json` は一時ファイル（`create_new`）+ rename で 0600．誰でも書き込める（o+w）設定ディレクトリは拒否する．
  - API URL: `--api-url`（その実行限り，永続化しない）> `config.json` の `apiUrl` > `LT_API_URL` > 既定値．どの経路でも `api_url::validate`（https のみ．ループバックだけ http 可）を通す．ブラウザで開く認可 URL は同じ規則に加えて，API URL と同じ origin であることを求め，表示・起動にはサーバーの生文字列ではなく `safe_url_to_open` が返す直列化済みの URL を使う（バックエンドは認可ページを API ホストから配信している）．
  - team/project: CLI オプション > `.lazy-tracker.json`（cwd から git root まで探索．リポジトリ外では HOME まで．それより上は `LT_PROJECT_FILE` で明示したときだけ読む．壊れたファイル・文字列以外の値・通常ファイル以外・64 KiB 超はエラー．`team`/`project` のみ読む．境界の `.git` が cwd の所有者以外のものならエラー（`/tmp` などへの仕込み対策．黙って飛ばすと境界がずれる）．チケット番号の解決と `tickets create` で project file から決めた場合は，そのパスを stderr に出す）> グローバル設定，を項目ごとにマージ（`project_file.rs`）．`.lazy-tracker.json` から API URL を読まないのは意図的（コミットされたファイルでトークン送信先を乗っ取らせないため）．
  - Bun 版（v0.1.x）の `lazy-tracker-cli-nodejs/config.json` からの移行は `legacy.rs`．`LT_CONFIG_DIR` 設定時は行わない．logout / トークン破棄時は旧ファイルの `tokens` も消す．
  - チケット番号はプロジェクト内でのみ一意．数字のみの引数は team/project を解決して番号 → UUID に変換する（`src/ticket_ref.rs`）．コメント API は UUID でしか引けない．
- **出力規約**（`src/output/`）: stdout はコマンドの結果専用（JSON は `print_json` で 2 スペースインデント，`--table` のテーブル，`config` / `auth status` の表示，`skills` の本文）．スピナー（indicatif，stderr が TTY のときだけ動く）・`✓ ✗ ! i` の状態行・確認プロンプト・診断ログはすべて stderr（`Ui`）．`--verbose` の `debug*`（`src/log.rs`）は method / URL / ステータス / 経過 ms / エラーボディ（2000 文字で切り詰め）のみを記録し，ヘッダ・トークン・OAuth エンドポイントのボディは決してログにもエラー表示にも出さない．色は `--no-color` / `NO_COLOR` / 非 TTY で無効．他者やサーバー由来の文字列（チケットのタイトル・エラーメッセージ・エラーボディ）は `style::strip_controls*` で制御文字と bidi 制御を `?` に置き換えてから端末に出す．
- **エラー処理**: コマンドは `Result<(), CliError>` を返し，失敗時はスピナーの失敗行を出してから `main` が `format_error`（`--verbose` でステータス・レスポンス・cause チェーンを付加）を stderr に出して exit 1．引数パースエラーは clap 既定の exit 2．削除系の確認は stdin が TTY でなければ `--force` を案内して exit 1．
- **スキル配布**: `skills/lazy-tracker-cli/SKILL.md` は `include_str!` でバイナリに埋め込まれ，`lt skills install` でエージェント（claude-code → `.claude/skills`，codex/copilot/cursor → `.agents/skills`）の信頼ディレクトリに書き込まれる．このファイルの変更は CI が警告を出し，内容レビューが必要になる．`--project` スコープの git root 解決（`src/skills/git_root.rs`）は書き込み先の乗っ取りを防ぐため，worktree / submodule の既知レイアウトのみを辿る．symlink 越しの書き込みは拒否する．

## テスト

- `cargo test` は実ユーザーの Keychain / Secret Service / 設定ディレクトリに触れてはならない．統合テスト（`tests/cli.rs`）は必ず `tests/support/env.rs` の `TestEnv` 経由で `lt` を起動する（`LT_CONFIG_DIR` / `LT_INSECURE_TOKEN_FILE=1` / `HOME` / `XDG_CONFIG_HOME` を一時ディレクトリに向け，環境変数をクリアする）．
- HTTP は `tests/support/server.rs` のモックサーバー（`127.0.0.1:0` の逐次サーバー，method + path で台本を照合）．ユニットテストからも `#[path]` で同じファイルを使う．
- ユニットテストのストアは `MemoryStore` / `FileStore` + `tempfile`．
- テスト名で仕様（What）が読めるように書く．

## リリース

`Cargo.toml` の version を上げた PR をマージ → main 上のそのコミットに `v<version>` タグを push すると `.github/workflows/release.yml` が動く．タグと version の不一致，main の祖先でないコミットへのタグは失敗する．fmt / clippy / test を通ってからビルドする．Linux は musl 静的リンク，macOS は両アーキテクチャとも ad-hoc 再署名して `codesign --verify` する（未署名・不正署名の arm64 バイナリは Apple Silicon で SIGKILL される）．成果物は `lt-macos-arm64` / `lt-macos-x64` / `lt-linux-x64` / `lt-linux-arm64` / `SHA256SUMS` で，各バイナリに `actions/attest-build-provenance` の来歴証明を付ける（`gh attestation verify` で検証できる）．タグ名に `-` を含む（`v0.2.0-rc.1` など）と pre-release になり Latest を奪わない．

workflow の action はコミット SHA で固定し，行末に `# vX.Y.Z` を書く．ランナーラベルは YAML アンカーで workflow ごとに 1 か所にまとめてある（GHEC 移行時の書き換え用 TODO 付き）．古い actionlint（1.7.7 で確認）はアンカーを解釈できない（1.7.12 は可）．

## コードスタイル

- rustfmt 既定 + `cargo clippy -- -D warnings`（`[lints.clippy] all = "warn"`）．
- モジュールは `mod.rs` を使わない（`src/auth.rs` + `src/auth/*.rs`）．
- コメントは英語で，コードから読み取れない制約・トレードオフ・「なぜ他の方法を採らなかったか」に限る．
