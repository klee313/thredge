alter table users add column if not exists oauth_provider varchar(30);
alter table users add column if not exists oauth_subject varchar(255);
alter table users add column if not exists oauth_email varchar(320);

create unique index if not exists idx_users_oauth_provider_subject
    on users (oauth_provider, oauth_subject);

create index if not exists idx_users_oauth_email
    on users (oauth_email);
