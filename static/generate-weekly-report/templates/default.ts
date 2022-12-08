const tpl=`
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
                    <a target="_blank" href="https://jira.domain.io/browse/<%= task.key %>">[<%= task.key %>]</a> <%= task.summary %> - <%= task.status %>
                </span>
            </li>
        <% }); %>
        </ul>
    </li>
  <% }); %>
</ul>

`

export default tpl;