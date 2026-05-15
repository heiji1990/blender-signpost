# アフィリエイト リンク投入ワークシート

各プログラムに登録後、対象ページのトラッキングリンクを発行し、下の「affiliateリンク」欄に貼って秘書（Claude）に渡せば、JSONへ一括投入＆デプロイします。

## 登録すべきプログラム（優先順）

| # | プログラム | 登録URL | カバー対象 | 備考 |
|---|---|---|---|---|
| 1 | **Impact.com** | https://impact.com/ → Udemy partner program に申請 | Udemy講座 6件 | 2025/10〜Udemy公式はImpact一本化。報酬 通常10%/サブスク20% |
| 2 | **A8.net** | https://www.a8.net/ | Coloso講座 2件 | 国内最大ASP・無料・即時登録。Coloso掲載あり |
| 2' | (代替) Colosoパートナーズ | https://coloso.jp/event/colosopartnersjp | Coloso講座 2件 | A8で通らない場合の直接プログラム。どちらか一方でOK |
| 3 | Superhive | 既存Superhiveアカウントでログイン→Affiliate設定 | アドオン5件 | 作成者ごと承認制。即効性低・後回し可 |

note(c006)/Gumroad(c009)/公式アドオン(a004,a008-a010) はアフィリエイト無しまたは無料 → 通常リンクのまま（対応不要）。

## Udemy講座（Impact.com）— 6件

| id | タイトル | 販売ページ(現在のurl) | affiliateリンク（ここに貼る） |
|---|---|---|---|
| c001 | 最新Blender 4.x LTS版！3DCGモデリング集中講座 | （JSONのurl参照） | |
| c002 | Geometry Nodes マスタークラス | 〃 | |
| c004 | Blenderで作る3Dモーショングラフィックス講座 | 〃 | |
| c005 | フォトリアルCG建築ビジュアライゼーション | 〃 | |
| c008 | 超基礎！超入門！Blender 3DCG第3弾 | 〃 | |
| c010 | Blenderデジタルスカルプト～怪獣ソフビをつくろう～ | 〃 | |

## Coloso講座（A8.net or Colosoパートナーズ）— 2件

| id | タイトル | affiliateリンク（ここに貼る） |
|---|---|---|
| c003 | セルルック・アニメ調3DCG制作講座 | |
| c007 | Blenderキャラクターリギング&アニメーション講座 | |

## Superhiveアドオン（後回し・作成者承認制）— 5件

a001 Botaniq / a002 Hard Ops / a005 Auto-Rig Pro / a006 True Terrain / a007 Fog Pack
→ Superhiveの個別承認が下りたものから随時。

## 投入フロー

1. リンクが揃ったら、このワークシートの該当欄に貼る（全部でなくてOK・揃った分から）
2. 「このリンク投入して」と指示
3. Claude が該当 `src/content/courses/cXXX.json` に `"affiliateUrl"` + `"isAffiliate": true` を設定 → build → commit/push → Vercel 自動デプロイ
4. 反映後、詳細ページの「講座ページを見る」が登録リンクになり `rel="nofollow sponsored"` 付与（実装済み）
