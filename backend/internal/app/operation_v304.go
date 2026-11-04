package app

// Add nullable flow readings without rewriting past samples or pellet inputs.
func (a *App) initOperationFlow() error {
	rows, err := a.db.Query(`PRAGMA table_info(operation_samples)`)
	if err != nil {
		return err
	}
	columns := map[string]bool{}
	for rows.Next() {
		var id, notNull, primary int
		var name, kind string
		var defaultValue any
		if err = rows.Scan(&id, &name, &kind, &notNull, &defaultValue, &primary); err != nil {
			rows.Close()
			return err
		}
		columns[name] = true
	}
	err = rows.Err()
	rows.Close() // The app intentionally uses a single SQLite connection.
	if err != nil {
		return err
	}
	for _, name := range []string{"hk1_flow", "hk2_flow"} {
		if !columns[name] {
			if _, err = a.db.Exec(`ALTER TABLE operation_samples ADD COLUMN ` + name + ` REAL`); err != nil {
				return err
			}
		}
	}
	return nil
}
