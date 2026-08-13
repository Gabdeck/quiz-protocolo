CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`primary_blocker` text NOT NULL,
	`secondary_blocker` text NOT NULL,
	`primary_subpattern` text,
	`resistance_band` text NOT NULL,
	`utms_json` text DEFAULT '{}' NOT NULL,
	`source` text,
	`funnel_version` integer DEFAULT 3 NOT NULL,
	`quiz_version` integer DEFAULT 3 NOT NULL,
	`consent_version` text DEFAULT 'lead-save-v1' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_leads_email` ON `leads` (`email`);