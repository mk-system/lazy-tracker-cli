# repo-context: mk-system/lazy-tracker-cli（ci-mode 用）

## プロジェクト要約

Lazy Tracker（プロジェクト管理 SaaS、mk-system 開発。社内利用が主だが外部への販売もしている）をターミナルから操作する CLI クライアント。**本リポジトリ自体は OSS として公開されている**（ユーザー確認 2026-08-29）。TypeScript + Bun 製で、`bun build --compile` によるシングルバイナリを GitHub Releases で配布する（`README.md` インストール節）。認可・データ永続化はバックエンド API（既定 `https://api.lazy-tracker.com`、`src/config/constants.ts` の `DEFAULT_API_URL`）側が持ち、本リポジトリはその HTTP クライアントに徹する。

姉妹プロジェクトに `lazy-tracker`（本体バックエンド/フロントエンド）、`lazy-tracker-lp`（LP）がある。

**このリポジトリが公開 OSS であることの帰結**: 利用者は mk-system の開発者に閉じない。Lazy Tracker を購入した外部顧客企業のユーザーも同じ CLI を使う。また、無関係な第三者もリポジトリを fork し PR を送れる — マージされてリリースされたバイナリは mk-system の開発者・外部顧客の双方に配布されるため、**悪意あるコード混入（サプライチェーン攻撃）は mk-system 内部に閉じた被害にならない**。

## このシステムが使われる文脈

- 利用者は mk-system の開発者に加え、Lazy Tracker を契約している外部顧客企業のユーザーも含む（`lt` は OSS 公開・Lazy Tracker 本体は販売されているため）。ターミナルからチーム / プロジェクト / チケット / コメントを操作する
- 認証は OAuth 2.0 Device Authorization Grant（`src/auth/device-flow.ts`）。ブラウザで認可 → CLI がポーリングでトークン取得。`client_id` のみを送信する public client で client secret は持たない
- team/project の解決は CLI オプション → リポジトリ直下の `.lazy-tracker.json` → グローバル設定（`conf` パッケージ、OS 標準の設定ディレクトリ）の優先順位でマージされる（`README.md` team/project の解決優先順位節）
- `.lazy-tracker.json`（プロジェクトルートに置かれ、リポジトリに commit される想定のファイル）が読み取るのは team/project のみ。`apiUrl` は対象外（`src/config/project.ts` の `PartialProjectConfig` 型を参照）— 悪意あるコミットでこのファイルを書き換えても、リクエスト送信先（ひいては Bearer token の送り先）はハイジャックできない。`apiUrl` の指定元は CLI オプション / `LT_API_URL` 環境変数 / グローバル設定のみ

## 過去に実際に起きた問題

- PR#3（マージ済み）: JSON レスポンスの camelCase/snake_case 変換ミスで表示が誤っていた。また Bun 固有の既知バグ（`tty.isatty(1)` 呼び出し後、`console.log` の内容が flush される前にプロセスが終了する）により JSON パイプ出力が欠落することがあった → `process.stdout.write` + flush 待ちへ変更して対応
- mainブランチ時点（2026-08-29 確認）で、トークンの期限切れ検知・401 応答時のローカル状態同期に関する課題が未解決（PR#5 が対応を提案中・未マージ）。PR#5 がマージされたら本記述は無効

## システム性質

- 認証済み個人ユーザー（mk-system の開発者 + 外部顧客企業のユーザー）が使う CLI ツール。CLI 自身は外部公開された Web エンドポイントを持たない — 実行時の攻撃面はローカルファイルシステム（保存されたトークン）とローカル-API 間の通信に限られる
- **本リポジトリは OSS 公開されているため、コード変更の攻撃面はローカル実行時とは別に存在する**（ユーザー確認 2026-08-29）。第三者が fork してマージ前提の PR を送れる。悪意あるコード（トークン窃取・任意コード実行等）が紛れ込んでマージ・リリースされた場合、mk-system の開発者と Lazy Tracker の外部顧客の双方に配布される — 単一組織内の被害に閉じない
- マルチテナント分離・ロールベース制御はこのリポジトリのコードには存在しない。認可判定はバックエンド API 側が持つ（`lazy-tracker` リポジトリ側、本リポジトリからは検証不可）
- 既存の `--team <key>` / `--project <key>` オプションを含め、CLI 側は team/project 識別子の値検証・所属チェックを一切行わず、そのまま API リクエストパスへ渡す設計（`src/commands/tickets/list.ts:91,105,112,119`）。今後 team/project スコープに関わるパラメータを追加するコマンドでも同型になる見込み — 「CLI 側に検証がない」ことそのものは意図された設計であり、severity は常にバックエンド側の認可実装（本リポジトリでは検証不可、❓ になりうる）に依存する
- データ機密性: ローカルに保存されるのは access/refresh token のみ。mainブランチ時点では全プラットフォームでファイルシステムに平文保存（`README.md` 認証情報の保存場所節、`src/auth/store.ts` の `Conf` ストア）。macOS Keychain 連携は PR#5（未マージ）が提案中
- リリース運用: CI (`.github/workflows/ci.yaml`) は Lint / Format check / Build のみ。自動テストは存在しない（`src/` 配下に `*.test.ts` / `*.spec.ts` なし、`package.json` に test スクリプトなし）
- `.github/workflows/ci.yaml` のトリガーは `pull_request`（`pull_request_target` ではない）。外部 fork からの PR で CI が動く際、既定の `GITHUB_TOKEN` は read-only でリポジトリ Secrets は渡らない（GitHub Actions の既定挙動）。よって**フォーク PR の CI 実行時点**での Secrets 窃取は成立しにくいが、**マージ後のリリースビルド時点**（`bun run build:all` 等をメンテナ環境で実行する場面）のリスクは別に残る — 悪意あるコードは CI では検出されず、マージ後に初めて発火しうる
- `lt` の実行端末は開発者の専有マシンに限らず、共有ホスト（踏み台等）で使われる場面もある（ユーザー確認 2026-08-29）。トークンを標準出力・プロセス引数に露出させる経路は、同一ホストの他ユーザーが `ps` 経由で観測できる前提を置いて評価する
- mk-system の CI で `lt` を呼ぶ予定は無い（ユーザー確認 2026-08-29）。CI ログ経由のトークン漏洩経路は現時点で成立しないものとして扱う。CI 連携が始まったら本記述は無効
- `lt auth login` で取得する OAuth トークンは、ログイン時の team/project に限定されず、所属する全 team/project へのアクセス権を持つ（ユーザー確認 2026-08-29）。トークン漏洩系 finding の impact は「1 team/project 分のデータ」ではなく「所属する全 team/project のデータ」として評価する
- `lt tickets list` は team/project が解決できない場合（`.lazy-tracker.json` もグローバル設定も CLI オプションも無い場合）、スコープなしで `api.v1TicketsList()` を呼ぶ（`src/commands/tickets/list.ts:123-126`）。これは実装済みの挙動であり、ログインユーザーが所属する全 team/project のチケットを一度に返す。同じ team/project 解決パターンを再利用する新規コマンド（一括操作等）も同型の「無指定時は全件」挙動を引き継ぐ見込み
- `open()`（`open` npm パッケージ）は execFile ベースで OS 既定のハンドラを起動する実装であり、渡す文字列によるシェルインジェクションのリスクは低い（`src/auth/device-flow.ts` の `openVerificationUri`）。一方でドメイン/スキームの検証は行っていないため、サーバーレスポンス由来の URL をそのまま `open()` に渡す経路が増えると、偽の認可ページへ誘導するフィッシング（OAuth device code phishing）のリスクになる — トークンが全 team/project 横断でアクセス権を持つため impact は高く評価する

## severity 判断ガイド

以下は **🔵 改善提案** 止まりとして扱う:

- ローカルファイルシステム上のトークン平文保存そのもの（README で明記済み・利用者への注意喚起あり。既知のリスクとして受容されている状態への指摘）
- CI（Lint/Format/Build のみ、テストなし）の非改善を理由にした一般的な「テストがない」指摘 — このリポジトリの既知の状態であり、repo-context 追記時点では新規指摘の価値が低い

以下は通常通り **🔴 攻撃可能 / 🟡 リスク有** として扱う:

- device flow・token refresh の実装不備（token の検証省略、状態遷移の不整合など） — このリポジトリで実際に auth 関連の不具合(PR#5 で対応中)が起きているため警戒度は高い
- 保存済みトークンがログ・エラーメッセージ・外部送信先に漏れる経路
- トークンを標準出力・プロセス引数・ファイルへ露出させる経路（例: トークンをそのまま表示するデバッグ用サブコマンド、`--token` のようなコマンドライン引数での受け渡し） — 共有ホスト利用があるため同一ホストの他ユーザーによる `ps` 経由の観測が現実的な前提になり、かつトークンは全 team/project 横断でアクセス権を持つため impact は高い。攻撃者側も認証済み開発者だが、被害者が所属していて攻撃者が所属しない team/project のデータに攻撃者がアクセスできるようになる点で「権限昇格の差分」があり、hard suppression の対象にはしない
- 本リポジトリが OSS 公開されていることに起因するサプライチェーン攻撃の経路（不審な新規依存追加、ビルド/インストールスクリプトの悪用、外部 PR によるトークン窃取・任意コード実行コードの混入など）— 「変更者は信頼できる mk-system 開発者」という前提は成立しない。マージ・リリースされれば mk-system の開発者と Lazy Tracker の外部顧客の双方に配布される
- **「pwn request」パターン**（`.github/workflows/*.yml` のトリガーを `pull_request_target` にし、`actions/checkout` で fork PR の head SHA を明示チェックアウトする組み合わせ）— base リポジトリの `GITHUB_TOKEN`（write scope や secrets を持ちうる）で fork 由来の任意コードが実行される既知の攻撃パターン。mainブランチ時点（2026-08-29 確認）の `.github/workflows/ci.yaml` はこのパターンに該当しない（`pull_request` トリガーで fork 由来コードは read-only 権限でのみ実行される）が、**このパターンへの変更を提案する PR（トリガー種別の変更・checkout の ref 変更）は「CI 高速化」等の一見無害な理由でも通常検出対象として厳格に扱う**
- 破壊的操作（削除等）を確認プロンプトなしで一括実行できるようにする変更 — 既存の team/project 未指定時「全件返す」挙動（上記）と組み合わさると、被害範囲が実行者個人の作業内容を超えて、所属する team/project 全体に及ぶ設計になりやすい
- サーバーレスポンス由来の文字列を検証なしで `open()` 等に渡し、ユーザーの確認なしにブラウザ/外部アプリを起動させる経路（フィッシング誘導）

## anti-suppression list (context 無視で通常検出を維持)

- **XSS** (Reflected / Stored / DOM-based)
- **SQL Injection / NoSQL Injection / ORM Injection**
- **CSRF** (state-changing endpoints)
- **SSRF**
- **認可バイパス** (BOLA = Broken Object Level Authorization, BFLA = Broken Function Level Authorization)
- **シークレット漏洩** (ハードコードされた credentials、ログ/レスポンスへの token 漏洩)
- **認証フロー欠陥** (token rotation 不整合、session fixation, OAuth flow misconfiguration)
- **暗号化の不適切な利用** (弱い algorithm、固定 IV、適切でない padding)
- **デシリアライゼーション攻撃**
- **パストラバーサル / 任意ファイル書き込み**（ローカルファイルシステムへの書き込みを伴うコマンド全般）

## 自動生成ファイルの source_hint

| 生成 path パターン | 生成元 |
|---|---|
| `src/api/__generated__/**` | バックエンド（`lazy-tracker` リポジトリ）の OpenAPI 定義。`bun run generate-api`（`src/api/lib/generator.ts`、`swagger-typescript-api`）で再生成 |
