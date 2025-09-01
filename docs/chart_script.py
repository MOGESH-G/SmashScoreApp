import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

# Define the complete app architecture with all layers
architecture_data = [
    # Main App Layer
    {"component": "App.js", "parent": "", "layer": "App Root", "x": 5, "y": 10, "size": 25},
    
    # Main App Components Layer
    {"component": "Navigation", "parent": "App.js", "layer": "App Components", "x": 2, "y": 8.5, "size": 20},
    {"component": "AppProvider", "parent": "App.js", "layer": "App Components", "x": 5, "y": 8.5, "size": 20},
    {"component": "Ad Integration", "parent": "App.js", "layer": "App Components", "x": 8, "y": 8.5, "size": 20},
    
    # Core Screens Layer
    {"component": "HomeScreen", "parent": "Navigation", "layer": "Screens", "x": 0.5, "y": 7, "size": 15},
    {"component": "PlayerMgmt", "parent": "Navigation", "layer": "Screens", "x": 1.5, "y": 7, "size": 15},
    {"component": "TournamentCreate", "parent": "Navigation", "layer": "Screens", "x": 2.5, "y": 7, "size": 15},
    {"component": "TournamentBracket", "parent": "Navigation", "layer": "Screens", "x": 1, "y": 6, "size": 15},
    {"component": "MatchDetail", "parent": "Navigation", "layer": "Screens", "x": 2, "y": 6, "size": 15},
    {"component": "TournamentHist", "parent": "Navigation", "layer": "Screens", "x": 3, "y": 6, "size": 15},
    
    # Services Layer
    {"component": "StorageService", "parent": "AppProvider", "layer": "Services", "x": 4, "y": 7, "size": 18},
    {"component": "TournamentSvc", "parent": "AppProvider", "layer": "Services", "x": 5, "y": 7, "size": 18},
    {"component": "PlayerService", "parent": "AppProvider", "layer": "Services", "x": 6, "y": 7, "size": 18},
    {"component": "AdService", "parent": "Ad Integration", "layer": "Services", "x": 8, "y": 7, "size": 18},
    
    # Utils Layer
    {"component": "BracketGen", "parent": "TournamentSvc", "layer": "Utils", "x": 4.5, "y": 5, "size": 12},
    {"component": "MatchPairing", "parent": "TournamentSvc", "layer": "Utils", "x": 5.5, "y": 5, "size": 12},
    {"component": "Helpers", "parent": "StorageService", "layer": "Utils", "x": 4, "y": 4.5, "size": 12},
    
    # Data Models Layer
    {"component": "Player Model", "parent": "PlayerService", "layer": "Models", "x": 3.5, "y": 3.5, "size": 10},
    {"component": "Tournament Model", "parent": "TournamentSvc", "layer": "Models", "x": 5, "y": 3.5, "size": 10},
    {"component": "Match Model", "parent": "TournamentSvc", "layer": "Models", "x": 6.5, "y": 3.5, "size": 10},
    
    # External Dependencies Layer
    {"component": "React Navigation", "parent": "", "layer": "Dependencies", "x": 1, "y": 2, "size": 12},
    {"component": "AdMob", "parent": "", "layer": "Dependencies", "x": 5, "y": 2, "size": 12},
    {"component": "AsyncStorage", "parent": "", "layer": "Dependencies", "x": 9, "y": 2, "size": 12}
]

# Convert to DataFrame for easier manipulation
df = pd.DataFrame(architecture_data)

# Color mapping for layers
layer_colors = {
    "App Root": "#1FB8CD",
    "App Components": "#DB4545", 
    "Screens": "#2E8B57",
    "Services": "#5D878F",
    "Utils": "#D2BA4C",
    "Models": "#B4413C",
    "Dependencies": "#964325"
}

# Create scatter plot with custom styling
fig = go.Figure()

# Add connections first (so they appear behind nodes)
for _, row in df.iterrows():
    if row['parent'] and row['parent'] in df['component'].values:
        parent_row = df[df['component'] == row['parent']].iloc[0]
        fig.add_trace(go.Scatter(
            x=[parent_row['x'], row['x']],
            y=[parent_row['y'], row['y']],
            mode='lines',
            line=dict(color='rgba(128,128,128,0.3)', width=1),
            showlegend=False,
            hoverinfo='skip'
        ))

# Add nodes for each layer
for layer in layer_colors.keys():
    layer_data = df[df['layer'] == layer]
    if not layer_data.empty:
        fig.add_trace(go.Scatter(
            x=layer_data['x'],
            y=layer_data['y'],
            mode='markers+text',
            marker=dict(
                size=layer_data['size'],
                color=layer_colors[layer],
                line=dict(width=2, color='white')
            ),
            text=layer_data['component'],
            textposition='middle center',
            textfont=dict(size=8, color='white'),
            name=layer,
            hovertemplate='<b>%{text}</b><br>Layer: ' + layer + '<extra></extra>'
        ))

# Update layout
fig.update_layout(
    title="SmashScore App Architecture",
    xaxis=dict(showgrid=False, zeroline=False, showticklabels=False, range=[-1, 11]),
    yaxis=dict(showgrid=False, zeroline=False, showticklabels=False, range=[1, 11]),
    plot_bgcolor='rgba(0,0,0,0)',
    legend=dict(orientation='h', yanchor='bottom', y=1.02, xanchor='center', x=0.5),
    showlegend=True
)

# Remove axis lines
fig.update_xaxes(visible=False)
fig.update_yaxes(visible=False)

# Save the chart
fig.write_image("app_architecture.png")
print("Updated architecture chart saved as app_architecture.png")