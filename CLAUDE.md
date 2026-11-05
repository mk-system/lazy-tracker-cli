# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

Lazy Tracker（mk-system のプロジェクト管理 SaaS）をターミナルから操作する CLI `lt`．TypeScript + Bun 製で，`bun build --compile` のシングルバイナリを GitHub Releases で配布する．認可・永続化はバックエンド API（既定 `https://api.lazy-tracker.com`）側にあり，本リポジトリは HTTP クライアントに徹する．

**OSS として公開されており**，リリースバイナリは mk-system 外の顧客にも配布される．外部 fork からの PR を前提に，依存追加・ビルドスクリプト・CI トリガー（`pull_request_target` 化など）・`skills/` 配下の変更は慎重に扱うこと．セキュリティ上の前提と severity 判断は `.github/review-pr/repo-context.md` にまとまっている（ただし「テストが存在しない」等の記述は現状と異なる）．

## コマンド

ランタイム・パッケージマネージャは Bun（`bun.lock`）．

```sh
bun install
bun run dev -- <args>        # 例: bun run dev -- --verbose tickets list
bun test                     # 全テスト（bun:test）
bun test src/api/client.test.ts      # 単一ファイル
bun test -t '<テスト名の一部>'        # 名前で絞り込み
bun run lint                 # eslint
bun run format:check         # prettier（CI はこちら）/ bun run format で整形
bun run build                # dist/lt（ローカル用シングルバイナリ）
bun run generate-api         # API クライアント再生成（localhost:8080 でバックエンド起動が必要）
```

CI（`.github/workflows/ci.yaml`）は lint → format:check → test → build の順に実行する．pre-commit は husky + lint-staged（`src/api/__generated__/` は除外）．

## アーキテクチャ

- **エントリ**: `bin/lt.ts` → `src/index.ts`．commander の `program` にグローバルオプション（`--api-url` / `--no-color` / `--verbose`）と `config` / `config:set` を定義し，各サブコマンドは `src/commands/<group>/index.ts` で `Command` を組み立てて `addCommand` する．1 サブコマンド = 1 ファイル．
- **API クライアント**: `src/api/__generated__/` は `swagger-typescript-api` による自動生成物で，手で編集しない（`src/api/lib/generator.ts` で再生成）．`src/api/client.ts` の `customFetch` がすべてのリクエストを通り，次を担う:
  - リクエストボディを snake_case へ，JSON レスポンスを camelCase へ変換（`humps`）．コマンド側は camelCase で扱う．
  - 非 2xx を `APIError`，401 をトークン破棄 + `AuthenticationError`，それ以外の例外を `NetworkError` に変換．
  - `securityWorker` が `getValidAccessToken()` で Bearer トークンを付与（期限切れ前に自動リフレッシュ）．
- **認証**: OAuth 2.0 Device Authorization Grant（`src/auth/device-flow.ts`，public client で secret なし）．トークン保存は `src/auth/store.ts` が抽象化し，macOS では Keychain（`security` コマンド経由，`keychain.ts`），それ以外は `conf` による平文ファイル．ファイル → Keychain の移行はモジュール読み込み時に走る．
- **設定の解決**:
  - API URL: `--api-url`（その実行限り，永続化しない）> `config:set api-url`（永続）> `LT_API_URL` > 既定値．https のみ許可．
  - team/project: CLI オプション > `.lazy-tracker.json`（cwd から上位へ探索，`team`/`project` のみ読む）> グローバル設定，を項目ごとにマージ（`src/config/project.ts`）．`.lazy-tracker.json` から API URL を読まないのは意図的（コミットされたファイルでトークン送信先を乗っ取らせないため）．
  - チケット番号はプロジェクト内でのみ一意．数字のみの引数は team/project を解決して番号 → UUID に変換する（`src/config/ticket.ts`）．コメント API は UUID でしか引けない．
- **出力規約**: stdout はコマンドの JSON ペイロード専用（`printJson`，Bun のパイプ時切り詰め回避のため `process.stdout.write` + drain を使う）．`--table` 指定時のみテーブル出力．スピナー（ora）・診断ログはすべて stderr．`--verbose` の `debug*`（`src/utils/logger.ts`）は method / URL / ステータス / エラーボディのみを記録し，ヘッダ・トークン・OAuth トークンエンドポイントのボディは決してログに出さない．
- **エラー処理**: 各コマンドの action は try/catch で `failSpinner` → `console.error(formatError(err))` → `process.exit(1)` の形を取る．`formatError` は `--verbose` 時にステータス・レスポンス・スタック・cause を付加する．
- **スキル配布**: `skills/lazy-tracker-cli/SKILL.md` はテキスト import でバイナリに埋め込まれ，`lt skills install` でエージェント（claude-code → `.claude/skills`，codex/copilot/cursor → `.agents/skills`）の信頼ディレクトリに書き込まれる．このファイルの変更は CI が警告を出し，内容レビューが必要になる．`--project` スコープの git root 解決（`findGitRoot`）は書き込み先の乗っ取りを防ぐため，worktree / submodule の既知レイアウトのみを辿る．

## リリース

`package.json` の version を上げた PR をマージ → そのコミットに `v<version>` タグを push すると `.github/workflows/release.yml` が動く（タグと version の不一致は失敗する）．macOS バイナリは macos ランナーでネイティブビルドし ad-hoc 再署名する（`bun --compile` の署名が arm64 で SIGKILL されるため）．

## コードスタイル

Prettier: シングルクォート・セミコロンあり・printWidth 100・trailingComma es5．ESM（`"type": "module"`，`NodeNext`）なので相対 import には `.js` 拡張子を付ける．未使用引数は `_` プレフィックス．
