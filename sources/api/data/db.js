module.exports = {
  requests: [
    {
      id: 1,
      title: "Average points",
      description: "Average points for players in selected Teams",
      query:
        "SELECT AVG(p.points) as moyenne FROM `player` p WHERE team IN (:team)"
    },
    {
      id: 2,
      title: "Players",
      description: "List of all players",
      query: "SELECT * FROM `player` p"
    },
    {
      id: 3,
      title: "Fantasy selection",
      description: "Complex query with multiple parameters",
      query: `
        SELECT
          p.name, p.team, f.last_pick
        FROM
          'fantasy' f
        INNER JOIN \`player\` p ON f.player_id = p.id
        WHERE f.user_id = :userid
        AND last_pick BETWEEN :date_start AND :date_end
      `
    }
  ],
  parameters: [
    {
      id: 1,
      request_id: 1,
      name: "team",
      type: "text",
      label: "Teams (eg: CLE,NYC)"
    },
    {
      id: 2,
      request_id: 3,
      name: "userid",
      type: "number",
      label: "User id"
    },
    {
      id: 3,
      request_id: 3,
      name: "date_start",
      type: "date",
      label: "Date de début (inclus)"
    },
    {
      id: 4,
      request_id: 3,
      name: "date_end",
      type: "date",
      label: "Date de fin (inclus)"
    },
  ]
};
