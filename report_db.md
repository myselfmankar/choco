| App/Folder           | Database Name  |
|----------------------|---------------|
| blog_mern_app        | blog_db       |
| ecommerce_mern_app   | ecommerce_db  |
| event_mern_app       | event_db      |
| pcs_mern_app         | pcs_db        |
| student_mern_app     | student_db    |
| task_mern_app        | task_db       |


1. mongosh

2. show databases

3. use <db_name>

4. show collections

5. db.<collection_name>.find().pretty();


----

For example:
```
test> show databases
admin          40.00 KiB
blog_db         8.00 KiB
config        108.00 KiB
ecommerce_db   96.00 KiB
event_db       40.00 KiB
local          72.00 KiB
pcs_db         40.00 KiB

test> use ecommerce_db
switched to db ecommerce_db

ecommerce_db> show collections
cartitems
orders
products

ecommerce_db> db.orders.find()

ecommerce_db> use pcs_db
switched to db pcs_db

pcs_db> show collections
files

pcs_db> db.files.find()


```


