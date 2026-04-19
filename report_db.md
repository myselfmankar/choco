# Database Topology Report

This report documents the database and collection structure for all MERN applications in the workspace. Logical bugs related to implicit collection naming and data persistence have been fixed.

| App Name | Database Name | Collection Name | Description | Useful MongoDB Commands |
| :--- | :--- | :--- | :--- | :--- |
| **Blog App** | `blog_db` | `posts` | Stores blog articles, titles, and authors. | `use blog_db; db.posts.find().pretty();` |
| **Ecommerce App** | `ecommerce_db` | `products` | Stores product catalog (price, category, image). | `use ecommerce_db; db.products.find();` |
| | | `cartitems` | Temporary storage for user cart. | `db.cartitems.find();` |
| | | `orders` | **NEW:** Persistent storage for confirmed orders. | `db.orders.find().sort({orderedAt: -1});` |
| **Event App** | `event_db` | `registrations` | Stores event participant details and team size. | `use event_db; db.registrations.find();` |
| **Student App** | `student_db` | `students` | Stores student records, roll numbers, and marks. | `use student_db; db.students.find();` |
| **Task App** | `task_db` | `tasks` | Stores todo items, category, and completion status. | `use task_db; db.tasks.find();` |
| **Aura Cloud (PCS)**| `pcs_db` | `files` | Metadata for uploaded files (size, mimeType). | `use pcs_db; db.files.find();` |
