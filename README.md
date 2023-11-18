Projek Akhir (T4)

1. Article Comments (Articles_Comments) -> { pk, uuid, article_id, author_id, comment } // bebas (patokan)

2. Article Comments Replies (Articles_Replies) -> { pk, uuid, article_id, comment_id, author_id, reply }

3. Like / Unlike Comment (Articles_Comments_Likes) -> samain kayak articles likes

4. Like / Unlike Comment Reply (Articles_Replies_Likes)

5. Article Favorites / Bookmark (Add To Bookmark, Remove From Bookmark)

6. Article Popular (Date Range created_at pada Article View)
   setiap user get article by id -> nambah ke article view,
   tambah views di article
