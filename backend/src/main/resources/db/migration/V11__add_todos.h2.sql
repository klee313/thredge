create table if not exists todos (
    id uuid primary key,
    owner_id uuid not null,
    task text not null,
    deadline date not null,
    priority varchar(10) not null,
    blocker text not null,
    solution text not null,
    done boolean not null,
    created_at timestamp not null,
    updated_at timestamp not null,
    constraint fk_todos_owner_id foreign key (owner_id) references users (id)
);

create index if not exists idx_todos_owner_deadline
    on todos (owner_id, deadline);
