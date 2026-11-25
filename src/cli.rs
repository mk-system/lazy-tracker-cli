use clap::{Args, Parser, Subcommand, ValueEnum};

#[derive(Debug, Parser)]
#[command(
    name = "lt",
    version,
    about = "Lazy Tracker CLI - A command-line interface for Lazy Tracker"
)]
pub struct Cli {
    #[command(flatten)]
    pub global: GlobalArgs,
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Debug, Args)]
pub struct GlobalArgs {
    /// API URL override (this invocation only, not persisted)
    #[arg(long, global = true, value_name = "URL")]
    pub api_url: Option<String>,
    /// Disable colored output
    #[arg(long, global = true)]
    pub no_color: bool,
    /// Print diagnostic logs (requests, error responses, causes) to stderr
    #[arg(long, global = true)]
    pub verbose: bool,
}

#[derive(Debug, Subcommand)]
pub enum Command {
    /// Authentication commands
    Auth {
        #[command(subcommand)]
        command: AuthCommand,
    },
    /// List teams
    Teams(TeamsArgs),
    /// List projects
    Projects(ProjectsArgs),
    /// Ticket management commands
    Tickets {
        #[command(subcommand)]
        command: TicketsCommand,
    },
    /// Comment management commands
    Comments {
        #[command(subcommand)]
        command: CommentsCommand,
    },
    /// Manage CLI skills for coding agents
    Skills {
        #[command(subcommand)]
        command: Option<SkillsCommand>,
    },
    /// Show current configuration
    Config,
    /// Set configuration value
    #[command(name = "config:set")]
    ConfigSet {
        /// Configuration key (api-url, default-team, default-project)
        key: String,
        /// Configuration value
        value: String,
    },
}

#[derive(Debug, Subcommand)]
pub enum AuthCommand {
    /// Login to Lazy Tracker using OAuth Device Authorization
    Login {
        /// Force re-login even if already authenticated
        #[arg(short, long)]
        force: bool,
    },
    /// Logout from Lazy Tracker
    Logout {
        /// Revoke the access token on the server
        #[arg(long)]
        revoke: bool,
    },
    /// Show current authentication status
    Status,
}

#[derive(Debug, Args)]
pub struct TeamsArgs {
    /// Output as JSON
    #[arg(long)]
    pub json: bool,
}

#[derive(Debug, Args)]
pub struct ProjectsArgs {
    /// Filter by team key
    #[arg(short, long, value_name = "KEY")]
    pub team: Option<String>,
    /// Show recently accessed projects
    #[arg(short, long)]
    pub recent: bool,
    /// Output as JSON
    #[arg(long)]
    pub json: bool,
}

#[derive(Debug, Args)]
pub struct TicketTarget {
    /// Ticket ID (UUID) or ticket number
    #[arg(value_name = "TICKET_ID_OR_NUMBER")]
    pub ticket: String,
    /// Team key (required for ticket number)
    #[arg(short, long, value_name = "KEY")]
    pub team: Option<String>,
    /// Project key (required for ticket number)
    #[arg(short, long, value_name = "KEY")]
    pub project: Option<String>,
}

#[derive(Debug, Subcommand)]
pub enum TicketsCommand {
    /// List tickets (JSON output by default)
    List(TicketsListArgs),
    /// Show ticket details (JSON output)
    Show(TicketTarget),
    /// Create a new ticket (JSON output)
    Create(TicketsCreateArgs),
    /// Update a ticket (JSON output)
    Update(TicketsUpdateArgs),
    /// Delete a ticket
    Delete {
        #[command(flatten)]
        target: TicketTarget,
        /// Skip confirmation
        #[arg(short, long)]
        force: bool,
    },
}

#[derive(Debug, Args)]
pub struct TicketsListArgs {
    /// Filter by team key
    #[arg(short, long, value_name = "KEY")]
    pub team: Option<String>,
    /// Filter by project key (requires --team)
    #[arg(short, long, value_name = "KEY")]
    pub project: Option<String>,
    /// Filter by state (unscheduled, created, started, finished, delivered, accepted, rejected)
    #[arg(short, long)]
    pub state: Option<String>,
    /// Filter by list type (done, current_backlog, icebox)
    #[arg(long, value_name = "TYPE")]
    pub list_type: Option<String>,
    /// Display as table instead of JSON
    #[arg(long)]
    pub table: bool,
    /// Comma-separated columns for table (default: ticketNumber,title,state,projectKey,teamKey)
    #[arg(long, value_name = "COLS")]
    pub columns: Option<String>,
}

#[derive(Debug, Args)]
pub struct TicketsCreateArgs {
    /// Team key
    #[arg(short, long, value_name = "KEY")]
    pub team: Option<String>,
    /// Project key
    #[arg(short, long, value_name = "KEY")]
    pub project: Option<String>,
    /// Ticket title
    #[arg(long)]
    pub title: String,
    /// Ticket description
    #[arg(short, long, value_name = "TEXT")]
    pub description: Option<String>,
    /// Ticket type (normal, release)
    #[arg(long = "type", value_name = "TYPE", default_value = "normal")]
    pub ticket_type: String,
    /// Initial state (unscheduled, created, started)
    #[arg(long, default_value = "created")]
    pub state: String,
    /// List type (done, current_backlog, icebox)
    #[arg(long, value_name = "TYPE", default_value = "current_backlog")]
    pub list_type: String,
    /// Story points
    #[arg(long, value_name = "POINTS")]
    pub point: Option<String>,
    /// Release date (YYYY-MM-DD)
    #[arg(long, value_name = "DATE")]
    pub release_date: Option<String>,
}

#[derive(Debug, Args)]
pub struct TicketsUpdateArgs {
    #[command(flatten)]
    pub target: TicketTarget,
    /// New title
    #[arg(long)]
    pub title: Option<String>,
    /// New description
    #[arg(short, long, value_name = "TEXT")]
    pub description: Option<String>,
    /// New state (created, started, finished, delivered, accepted, rejected)
    #[arg(long)]
    pub state: Option<String>,
    /// New story points (use "null" to clear)
    #[arg(long, value_name = "POINTS")]
    pub point: Option<String>,
    /// New release date (YYYY-MM-DD, use "null" to clear)
    #[arg(long, value_name = "DATE")]
    pub release_date: Option<String>,
}

#[derive(Debug, Subcommand)]
pub enum CommentsCommand {
    /// List comments on a ticket (JSON output)
    List(TicketTarget),
    /// Add a comment to a ticket (JSON output)
    Add {
        #[command(flatten)]
        target: TicketTarget,
        /// Comment message
        #[arg(short, long, value_name = "TEXT")]
        message: String,
    },
    /// Update a comment (JSON output)
    Update {
        /// Comment/Chat ID
        chat_id: String,
        /// New comment message
        #[arg(short, long, value_name = "TEXT")]
        message: String,
    },
    /// Delete a comment
    Delete {
        /// Comment/Chat ID
        chat_id: String,
        /// Skip confirmation
        #[arg(short, long)]
        force: bool,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, ValueEnum)]
pub enum Agent {
    ClaudeCode,
    Codex,
    Copilot,
    Cursor,
}

#[derive(Debug, Args)]
pub struct SkillsTargetArgs {
    /// Target agent
    #[arg(long, value_enum, value_name = "NAME")]
    pub agent: Option<Agent>,
    /// Use project scope (git root) instead of user scope
    #[arg(long)]
    pub project: bool,
    /// Use a custom directory
    #[arg(long, value_name = "PATH")]
    pub dir: Option<String>,
    /// Show what would be done without making changes
    #[arg(long)]
    pub dry_run: bool,
}

#[derive(Debug, Subcommand)]
pub enum SkillsCommand {
    /// Install CLI skills for a coding agent
    Install(SkillsTargetArgs),
    /// Remove CLI skills for a coding agent
    Uninstall {
        #[command(flatten)]
        target: SkillsTargetArgs,
        /// Skip confirmation
        #[arg(short, long)]
        force: bool,
    },
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::CommandFactory;

    #[test]
    fn cli_definition_is_consistent() {
        Cli::command().debug_assert();
    }

    #[test]
    fn global_options_are_accepted_after_the_subcommand() {
        let cli =
            Cli::try_parse_from(["lt", "teams", "--verbose", "--api-url", "https://x.example"])
                .unwrap();
        assert!(cli.global.verbose);
        assert_eq!(cli.global.api_url.as_deref(), Some("https://x.example"));
    }

    #[test]
    fn unknown_agents_are_rejected_by_the_parser() {
        assert!(Cli::try_parse_from(["lt", "skills", "install", "--agent", "toString"]).is_err());
        assert!(Cli::try_parse_from(["lt", "skills", "install", "--agent", "claude-code"]).is_ok());
    }
}
