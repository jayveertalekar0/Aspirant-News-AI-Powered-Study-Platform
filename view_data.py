import sqlite3

conn = sqlite3.connect('backend/news.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

c.execute("SELECT title, content,summary FROM news LIMIT 10")

for row in c.fetchall():
    print("\nTitle: ",row["title"])
    print("Content: ",row["content"])
    print("summary: ",row["summary"])
conn.close()