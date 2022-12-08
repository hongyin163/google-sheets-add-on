export default `

<ul>
  <% tasks.forEach(function(task){ %>
    <li>
        <span>
            <a target="_blank" href="https://jira.domain.io/browse/<%= task.key %>">[<%= task.key %>]</a> <%= task.summary %>
        </span>
        <ul>
        <% task.subtasks.forEach(function(task){ %>
            <li>
                <span>
                    <% if (task.devStartDate){ %>
                        [<%= task.devStartDate.replace(/-/g,'.') %> - <%= task.devDueDate.replace(/-/g,'.') %>]
                    <% } else { %>
                        [<%= task.plannedDevStartDate.replace(/-/g,'.') %> - <%= task.plannedDevDueDate.replace(/-/g,'.') %>]
                    <% } %>
                    <a target="_blank" href="https://jira.domain.io/browse/<%= task.key %>">[<%= task.key %>]</a> <%= task.summary %> - <%= task.status %>
                </span>
            </li>
        <% }); %>
        </ul>
    </li>
  <% }); %>
</ul>
`