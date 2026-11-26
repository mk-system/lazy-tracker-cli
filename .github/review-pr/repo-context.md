# repo-context: mk-system/lazy-tracker-cli（ci-mode 用）

## プロジェクト要約

Lazy Tracker（プロジェクト管理 SaaS、mk-system 開発。mk-system 社内での利用が主だが、外部企業へ販売もしている）をターミナルから操作する CLI `lt`。**本リポジトリ自体は OSS として公開されている**（ユーザー確認 2026-08-29）。Rust + clap 製で、macOS（arm64 / x64）と Linux（x64 / arm64、musl 静的リンク）のシングルバイナリを GitHub Releases で配布する（`.github/workflows/release.yml`）。Windows は非サポート（`src/main.rs` の `compile_error!`）。v0.1.x は TypeScript + Bun 製で、v0.2.0 で Rust に書き換えた（PR #29）。

認可・データ永続化はバックエンド API（既定 URL は `src/config/api_url.rs`）側が持ち、本リポジトリはその HTTP クライアントに徹する。姉妹リポジトリに `lazy-tracker`（バックエンド / フロントエンド）、`lazy-tracker-lp`（LP）がある。

**公開 OSS であることの帰結**: `lt` の利用者は mk-system の開発者に閉じず、Lazy Tracker を契約している外部企業のユーザーも同じバイナリを使う。無関係な第三者も fork から PR を送れる。マージ・リリースされたコードは mk-system の開発者と外部企業のユーザーの双方に配布されるため、**悪意あるコード混入（サプライチェーン攻撃）の被害は mk-system 内部に閉じない**。

## このシステムが使われる文脈

- 利用者は mk-system の開発者と、Lazy Tracker を契約している外部企業のユーザー。ターミナルからチーム / プロジェクト / チケット / コメントを操作する。`lt skills install` で AI エージェント（Claude Code / Codex / Copilot / Cursor）向けの手順書を配布し、エージェントが `lt` を実行する使い方もある（`skills/lazy-tracker-cli/SKILL.md`）
- 認証は OAuth 2.0 Device Authorization Grant（`src/auth/device_flow.rs`）。ブラウザで認可し、CLI がポーリングでトークンを得る。`client_id` だけを送る public client で、client secret は持たない
- `lt auth login` で得たトークンはログイン時の team/project に限定されず、**ログインユーザーが所属する全 team/project にアクセスできる**（ユーザー確認 2026-08-29）。要求するスコープは読み書きの両方（`src/auth.rs` の `DEFAULT_SCOPES`）。アクセストークンの有効期間は 8 時間、リフレッシュトークンは 30 日（`lazy-tracker` リポジトリの `OAuthService` の `ACCESS_TOKEN_EXPIRATION_SECONDS` / `REFRESH_TOKEN_EXPIRATION_DAYS`、2026-11-26 に確認）。保存されたトークンが漏れると、リフレッシュで最長 30 日間なりすましを続けられる。`lt auth logout --revoke`（`src/commands/auth.rs` の `logout`）でサーバーに失効を依頼すると、アクセストークンと対のリフレッシュトークンが即時に無効になる（同 `revokeToken`。API の認証は失効済みトークンを受け付けない）
- team/project のチケット・コメントは、その team/project の他のメンバーと共有するデータ。誤って削除・改変すると、実行者本人だけでなく他のメンバーの作業にも影響する
- チケット・コメントには、認証情報・個人情報・外部企業との契約上の機密が書かれることがありうる（ユーザー確認 2026-11-26）。本文がログ・エラー表示・AI エージェントのコンテキストに流れる経路は、業務データ一般ではなく機微情報の露出として評価する
- 利用者が不具合を報告する先は**公開の GitHub Issue** を想定している（ユーザー確認 2026-11-26）。`--verbose` のログやエラー表示に出たものは、利用者がそのまま貼り付けて公開しうる前提で評価する
- **削除したデータを利用者は復元できない**（ユーザー確認 2026-11-26）。バックエンドのバックアップからの復元は可能だが、利用者が自由に行えるものではない
- 削除の権限（ユーザー確認 2026-11-26。判定はバックエンド側）: team のロールが admin / member なら、他人のチケットを削除できる。他人のコメントはプロジェクトメンバーなら削除できる。viewer はどちらも削除できない。つまり **admin / member のトークンを使う `lt` は、自分以外が作ったチケットを消せる**
- `lt` は開発者の専有マシンに限らず、**共有ホスト（踏み台等）でも使われる**（ユーザー確認 2026-08-29）。同一ホストの他ユーザーがプロセス引数を `ps` で見られる前提で評価する
- 削除系コマンド（`tickets delete` / `comments delete`）は、stdin が TTY でなければ確認を出せず `--force` を求めて失敗する（`src/output/prompt.rs` の `ensure_can_confirm`）。そのため **AI エージェントから削除を実行する場合は事実上 `--force` 付きになる**。SKILL.md も `--force` を案内している
- mk-system の CI から `lt` を呼ぶ運用は無い（ユーザー確認 2026-08-29）。CI 連携が始まったら、CI ログ経由のトークン漏洩経路を評価し直す必要がある
- team/project は CLI オプション > `.lazy-tracker.json`（cwd から上位へ探索）> グローバル設定、の順で項目ごとにマージする（`src/config/project_file.rs`）。`.lazy-tracker.json` はリポジトリにコミットされる想定のファイルで、**読むのは `team` / `project` だけ**。API URL を読まないのは意図的で、悪意あるコミットでトークンの送信先を乗っ取らせないため
- API URL は `--api-url` > `config.json` の `apiUrl` > `LT_API_URL` > 既定値の順で決まり、どの経路も `src/config/api_url.rs` の `validate`（https のみ、ループバックだけ http 可）を通る
- 検証環境（ステージング）で発行したトークンは本番 API では通らない（ユーザー確認 2026-11-26）。主な理由は署名鍵ではなくバックエンドのセッション検証で、鍵が両環境で同じかは確認できていない。セッション検証の仕組みが変わったら、検証環境向けの経路で漏れたトークンの影響を評価し直す必要がある

## 過去に実際に起きた問題

- **トークンを「確実に無効」と分かる場合以外に破棄してはならない。** v0.1.x は API の 401 やリフレッシュの任意の失敗でローカルのトークンを消しており、サーバー側の一時的な不具合やネットワーク断でもログインが失われ、原因の切り分けも困難になった（issue #14、PR #29）。破棄してよいのはリフレッシュが 401 または 400 `invalid_grant` を返したときだけ（`src/auth/session.rs`）。トークンストアが読めないときに「未ログイン」として扱うことも同じ理由で禁止（`Ok(None)` は項目が確実に無いときだけ。`src/auth/store.rs`）
- **OAuth トークンエンドポイントへのリクエストに、サーバーが受け付けると確認していないフィールドを足してはならない。** サーバーは未知フィールドを 400 で拒否し、v0.1.1 / v0.1.2 で全ユーザーのログインとリフレッシュが失敗してリリースを取り消した（issue #14、PR #11、保留中の PR #13）
- **macOS 向けバイナリを Linux でクロスビルドしたり、再署名・検証の手順を外してはならない。** v0.1.3 以前の配布バイナリは署名が不正で、Apple Silicon では起動時に SIGKILL された（PR #20）。`release.yml` は macOS ランナーで両アーキテクチャをビルドし、ad-hoc 再署名 → `codesign --verify` を通す

## システム性質

- 認証済みユーザー（mk-system の開発者と外部企業のユーザー）が使う CLI。CLI 自身は待ち受けるエンドポイントを持たない。実行時の攻撃面は、ローカルに保存したトークン、ローカルから API への通信、サーバーレスポンスの扱い、`lt skills install` によるファイル書き込み
- **コード変更の攻撃面は実行時とは別に存在する**（公開 OSS のため。プロジェクト要約を参照）
- マルチテナント分離・ロール制御はこのリポジトリに存在しない。認可判定はバックエンド API 側にあり、本リポジトリからは検証できない。CLI は team/project の識別子を検証せず、percent-encode してリクエストパスに渡すだけ（`src/api/client.rs` の `build_url`）。「CLI 側に所属チェックがない」こと自体は意図された設計で、その種の finding の severity はバックエンドの認可実装に依存する
- `lt tickets list` は team/project を解決できないとき、スコープなしの一覧 API を呼び、ログインユーザーが所属する全 team/project のチケットを返す（`src/commands/tickets.rs` の `list`）。意図された挙動
- チケット番号はプロジェクト内でのみ一意。番号での指定は team/project を解決できないとエラーになるが、UUID での指定は team/project なしで通る（`src/ticket_ref.rs`）
- **トークンの保存先**（`src/auth/store.rs` の `select`）: macOS は Keychain（`/usr/bin/security` を絶対パスで起動、`src/auth/store/keychain.rs`）、Linux は Secret Service（`src/auth/store/secret_service.rs`）、`LT_INSECURE_TOKEN_FILE=1` のときだけ設定ディレクトリの `tokens.json`（0600）に平文で置く。平文ファイルは利用者が明示的に選ぶ逃げ道で、README に記載がある。Secret Service が使えない Linux（ヘッドレス・コンテナ・踏み台）では、自動で平文に切り替えず `StoreError::Unavailable` で失敗し、`LT_INSECURE_TOKEN_FILE=1` を案内する（`secret_service.rs` の `GUIDANCE`）。これは意図された設計で、利用者が選んでいないのに平文へ降格する変更は、下の 🔵 止まりの扱いを受けない
- Keychain を Security.framework で直接読み書きしないのは意図的（`keychain.rs` 冒頭のコメント）。既存項目の ACL は `/usr/bin/security` を信頼しており、ad-hoc 署名の `lt` はリリースごとに署名上の同一性が変わるため、直接読むと更新のたびに許可ダイアログが出て、SSH などの非対話セッションでは失敗する。直接呼び出しへの置き換えは、ログインが使えなくなる退行として扱う
- Keychain への書き込みは値を `security -i` の stdin で渡す。行が長すぎる場合と、ASCII 以外または制御文字を含む場合だけ argv にフォールバックする（`keychain.rs` の `plan_write`）。argv に載ると同一ホストの他ユーザーから `ps` で見えるが、通常のトークン（JSON で数百バイト）はこの条件に当たらない。`security -i` が長い行を分割して途中までの値を保存してしまう挙動を避けるための既知のトレードオフ
- トークンのリフレッシュと書き換えは `<config_dir>/auth.lock` の排他ロック内で行う（`src/auth/lock.rs`、`src/auth/session.rs`）。リフレッシュトークンはサーバー側でローテーションされるため、ロック外で書き換えると並行実行した別プロセスの更新を古い値で上書きし、ログインが失われる
- サーバーが返す認可 URL は `api_url::is_safe_to_open` でスキームだけを確かめてからブラウザで開く（`src/auth/device_flow.rs` の `open_browser`）。ドメインは確かめていない。`is_safe_to_open` は `validate` をそのまま呼ぶので、`validate` を緩める変更はブラウザで開く URL の検証も同時に緩める
- `--verbose` のログ（`src/log.rs`）は method / URL / ステータス / 経過時間 / エラーボディだけを stderr に出す。ヘッダ・トークン・OAuth エンドポイントのボディは出さない設計。OAuth の通信（`src/auth/oauth.rs`）も通常の API と同じ `transmit`（`src/api/client.rs`）を通り、何をログに出すかは呼び出し側が決める。`transmit` でボディやヘッダを出すようにすると、リフレッシュトークンや device code もログに出る
- `lt skills install` は `skills/lazy-tracker-cli/SKILL.md`（`include_str!` でバイナリに埋め込み）を、エージェントが信頼して読み込むディレクトリ（`.claude/skills` 等）に書き込む。書き込み先のスコープはユーザー（ホーム配下）・プロジェクト・任意パスの 3 種（`src/skills/agents.rs`）。どのスコープでも SKILL.md 自体が symlink なら書き込みを拒否し（`src/commands/skills.rs` の `install`）、既存ファイルは確認なしで上書きする。`--project` の git root は既知のレイアウトだけで辿る（`src/skills/git_root.rs`）
- `skills/` の変更に対する CI の警告はマージを止めない。fork からの PR を止める関門はレビューだけ
- CI（`.github/workflows/ci.yaml`）は `pull_request` トリガーで、`permissions: contents: read`。fork からの PR では Secrets が渡らない。ubuntu / macOS で fmt → clippy → test → release build を実行し、`skills/` 配下が変わると警告を出す
- リリース（`.github/workflows/release.yml`）はタグ push で動き、`contents: write` は Release を作る最後のジョブだけが持つ。配布バイナリは `build` ジョブで作られ、そのまま Release に載る。`SHA256SUMS` は同じワークフローで作るので、ビルド中の改ざんは検出できない。attestation などの来歴証明は無い
- workflow の action はコミット SHA で固定し、行末に版を書く規約（`CLAUDE.md` のリリース節）。ただしリポジトリ内に強制する仕組み（`actions.lock` 等）は無く、レビューで守っている
- 依存は crates.io から取得し、`Cargo.lock` をコミットしている。`build.rs` は無い。依存更新は Renovate（`renovate.json`）

## severity 判断ガイド

以下は **🔵 改善提案** 止まりとして扱う:

- `LT_INSECURE_TOKEN_FILE=1` を利用者が明示的に設定した場合の平文保存そのもの（README に記載済み）。自動フォールバックなど、利用者が選ばずに平文になる経路は含まない
- Keychain 書き込みの argv フォールバックで値が `ps` から見えうること（システム性質に書いたトレードオフ）。この扱いはこのフォールバックだけに限る。フォールバックの条件を広げる変更や、トークンを argv・stdout に載せる別の経路には当てはめない
- CLI が team/project 識別子の所属チェックをしないこと（認可はバックエンドの責務）

以下は通常通り **🔴 攻撃可能 / 🟡 リスク有** として扱う。上の 🔵 止まりの扱いを受けないという意味で、severity 自体は `severity-levels.md` の表で impact × likelihood から決める:

- トークンを破棄する条件を広げる変更、ストアの読み取り失敗を未ログインとして扱う変更、`auth.lock` の外でトークンを書き換える変更（「過去に実際に起きた問題」を参照）
- トークンがログ・エラーメッセージ・stdout・プロセス引数・ファイルに出る経路。利用者の明示的な操作で出す機能（トークンを表示するサブコマンド等）も含む。共有ホストで使われるため、`ps` による観測は現実的な前提になる。トークンは所属する全 team/project にアクセスできるので、攻撃者が本来アクセスできない team/project のデータに届く権限昇格の差分がある
- API URL やブラウザで開く URL の検証（`api_url::validate` / `is_safe_to_open`）を通らない経路の追加。`.lazy-tracker.json` から API URL を読む変更も含む
- サーバーレスポンス由来の文字列を確認なしにブラウザ・外部コマンドへ渡す経路（OAuth device code phishing）
- 公開 OSS であることに起因するサプライチェーンの経路: 不審な依存追加（crate と GitHub Actions の action の両方。SHA で固定しない action の追加を含む）、`build.rs` や proc-macro の追加、外部 PR によるトークン窃取・任意コード実行コードの混入。「変更者は信頼できる mk-system 開発者」という前提は成立しない
- **「pwn request」パターン**（トリガーを `pull_request_target` にし、fork の head を checkout する組み合わせ）や、workflow の `permissions` を広げる変更。「CI 高速化」など一見無害な理由でも厳格に扱う
- `skills/` 配下の変更と `lt skills install` の書き込み先の変更。エージェントが信頼して実行する指示として配布されるため、自然言語の内容自体がプロンプトインジェクションの経路になる
- 削除などの破壊的操作を確認なしで実行させる変更。コードの変更だけでなく、`skills/` の手順書で AI エージェントに確認なしの削除（`--force`）を指示する変更も含む。team/project 未指定時に全件を対象にする挙動と組み合わさると、被害が所属する全 team/project に及ぶ

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
- **コマンドインジェクション**（`/usr/bin/security`・ブラウザ起動・git など外部コマンドに渡す引数）

## 自動生成ファイルの source_hint

自動生成ファイルは無い。API クライアント（`src/api/endpoints.rs`）は OpenAPI から生成せず手書きしている。
