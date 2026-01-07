create index if not exists idx_thread_categories_category_thread
    on thread_categories (categories_id, thread_id);
