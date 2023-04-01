import {pool} from "../connection.js"

class History {
    getHistoryByUserId(param) {
        return pool.query("SELECT id, num_questions, topic from history WHERE user_id = $1",
            param);
    }

    getQuizById(param) {
        return pool.query("SELECT quiz from history WHERE id = $1", param)
    }

    saveHistory(param) {
        return pool.query("INSERT INTO history(user_id, topic, quiz, num_questions, type) VALUES($1, $2, $3, $4, $5)",
            param);
    }

    deleteHistory(param) {
        return pool.query("DELETE from history WHERE id = $1",
            param);
    }

    async createTables() {
        await pool.query("CREATE TABLE IF NOT EXISTS Users (id bigserial PRIMARY KEY, created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(), firstname text NOT NULL, email citext UNIQUE NOT NULL, version uuid NOT NULL DEFAULT gen_random_uuid(), apiKey text)")
        await pool.query("CREATE TABLE IF NOT EXISTS History (id bigserial PRIMARY KEY, created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(), user_id bigint NOT NULL REFERENCES Users ON DELETE CASCADE, topic text NOT NULL, quiz text[] NOT NULL, num_questions integer NOT NULL, type text NOT NULL)")
    }
}

export {
    History
}
