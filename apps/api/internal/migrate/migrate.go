package migrate

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

func ApplyDir(ctx context.Context, database *sql.DB, dir string) error {
	if err := ensureSchemaMigrations(ctx, database); err != nil {
		return err
	}
	files, err := sqlFiles(dir)
	if err != nil {
		return err
	}
	for _, file := range files {
		name := filepath.Base(file)
		applied, err := migrationApplied(ctx, database, name)
		if err != nil {
			return err
		}
		if applied {
			continue
		}
		if err := execFile(ctx, database, file); err != nil {
			return fmt.Errorf("%s: %w", name, err)
		}
		if _, err := database.ExecContext(ctx, `insert into schema_migrations (version) values ($1)`, name); err != nil {
			return fmt.Errorf("record migration %s: %w", name, err)
		}
	}
	return nil
}

func ExecDir(ctx context.Context, database *sql.DB, dir string) error {
	files, err := sqlFiles(dir)
	if err != nil {
		return err
	}
	for _, file := range files {
		if err := execFile(ctx, database, file); err != nil {
			return fmt.Errorf("%s: %w", filepath.Base(file), err)
		}
	}
	return nil
}

func ensureSchemaMigrations(ctx context.Context, database *sql.DB) error {
	_, err := database.ExecContext(ctx, `
		create table if not exists schema_migrations (
			version text primary key,
			applied_at timestamptz not null default now()
		)
	`)
	return err
}

func migrationApplied(ctx context.Context, database *sql.DB, name string) (bool, error) {
	var exists bool
	err := database.QueryRowContext(ctx, `select exists(select 1 from schema_migrations where version = $1)`, name).Scan(&exists)
	return exists, err
}

func execFile(ctx context.Context, database *sql.DB, file string) error {
	content, err := os.ReadFile(file)
	if err != nil {
		return err
	}
	_, err = database.ExecContext(ctx, string(content))
	return err
}

func sqlFiles(dir string) ([]string, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}
	files := []string{}
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		files = append(files, filepath.Join(dir, entry.Name()))
	}
	sort.Strings(files)
	return files, nil
}
