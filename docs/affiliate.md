# アフィリエイトリンク投入手順

サイト側の配線は完了済み。あとは**登録リンクを各コンテンツJSONに入れるだけ**で収益化が有効になる。

## 仕組み

`src/lib/affiliate.ts` の `resolveLink()` が全リンク（講座/アドオン/チュートリアル詳細・一覧カード・日英）を制御：

- `isAffiliate: true` かつ `affiliateUrl` あり → リンク先を `affiliateUrl` にし、`rel="nofollow sponsored noopener noreferrer"`（Googleの有料リンクポリシー準拠）
- それ以外 → 通常の `url`、`rel="noopener noreferrer"`

## 手順

1. アフィリエイトプログラムに登録（優先：Udemy/Coloso＝講座、Blender Market/Gumroad＝アドオン。国内はA8.net・もしも・バリューコマース経由も可）。
2. 各社の管理画面で対象ページのトラッキングリンクを発行。
3. 対応する JSON を編集：`src/content/courses/c0XX.json` / `src/content/addons/a0XX.json` / `src/content/tutorials/t0XX.json`
   ```json
   "affiliateUrl": "https://（発行されたトラッキングURL）",
   "isAffiliate": true,
   "isPr": false
   ```
   - `isPr: true` は「金銭を受け取った純粋なPR/タイアップ」のみ（表記が「PR」になる）。通常のアフィリエイトは `false`。
4. commit → push（main）。Vercel が自動デプロイ。**コード変更は不要**。

## 優先順位（最速で現金化）

1. **講座10件**（`src/content/courses/`）— 単価が高い
2. **アドオン10件**（`src/content/addons/`）— 有料アドオンに登録リンクがあれば
3. チュートリアル534件 — 大半は無料YouTubeで対象外。有料(Udemy等)のものだけ

## 確認

デプロイ後、対象ページの「〜を見る」リンクを右クリック→リンクURLが登録URLになっていること、ページソースで `rel="nofollow sponsored noopener noreferrer"` が付いていることを確認。
