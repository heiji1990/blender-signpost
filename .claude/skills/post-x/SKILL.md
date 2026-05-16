---
name: post-x
description: Blenderの道しるべ（@blender_michi）へX投稿する。「Xに投稿して」「ポストして」「お悩み投稿を流して」等で起動。投稿はGitHub Actions経由（ローカルにAPIキーは無い）。
---

# X投稿（Blenderの道しるべ / @blender_michi）

このプロジェクトのX自動投稿を手動で実行する手順。

## 重要な前提

- X APIキーは **GitHub Secrets のみ**（`X_API_KEY` / `X_API_SECRET` / `X_ACCESS_TOKEN` / `X_ACCESS_SECRET`）。**ローカルやチャットにキーは存在しない／貼らせない**。
- よって投稿は必ず **GitHub Actions ワークフロー `auto-post.yml`** 経由で行う（`gh` CLI 認証済み: heiji1990）。
- X API は従量課金。**URL付き投稿 ≈ $0.20 / テキストのみ ≈ $0.015**。残高が尽きると 402 で失敗するので無闇に連投しない。
- 通常運用は **週1 cron（月 08:00 JST）の `painpoint` モード**。これは触らない。手動投稿はそれに**追加**で打つもの。

## 投稿手順

1. モードを決める（ユーザー指定が無ければ `painpoint` を既定にし、何を投稿するか一言伝えてから実行）:
   - `painpoint` … お悩み→対策→最適コンテンツ＋理由（一番訴求力が高い既定形式）
   - `random` … 全コンテンツからランダム1件紹介
   - `tutorial` / `course` / `addon` … 種別を絞ってランダム紹介
   - `test` … 疎通確認用テキスト（実投稿される。動作確認時のみ）
2. ドライラン確認したい場合は `dry_run=true`（投稿せずGitHub Actionsログに本文だけ出力。費用ゼロ）。本番投稿は `dry_run=false`。
3. 実行:
   ```
   gh workflow run auto-post.yml -f mode=<MODE> -f dry_run=<true|false>
   ```
4. 数秒後に起動確認:
   ```
   gh run list --workflow=auto-post.yml --limit 1
   ```
5. 完了まで待って結果確認（成功/失敗・投稿本文・Post ID）:
   ```
   gh run view <RUN_ID> --log | grep -E "Picked|Painpoint|Post content|Posted:|Error|402|CreditsDepleted"
   ```
6. ユーザーへ：投稿モード・本文要約・成否・（成功なら）タイムラインで確認を依頼。

## 失敗時の典型

- `402 CreditsDepleted` … X APIクレジット切れ。ユーザーに X Developer Portal でのチャージを案内（投稿は再実行で復活）。
- `Node.js 20 deprecated` の黄色警告は無害（失敗ではない）。

## 関連

- スクリプト: `scripts/post-to-x.js`（モード分岐・本文生成）
- お悩みバンク: `scripts/painpoints.json`（painpointモードの元ネタ・週替りローテ）
- ワークフロー: `.github/workflows/auto-post.yml`（cron週1＋workflow_dispatch手動）
- 投稿構成や頻度を変えたい時はこれらを編集（[[project-blender-signpost]] 参照）。
