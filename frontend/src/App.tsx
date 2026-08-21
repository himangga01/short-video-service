import Layout from './components/Layout';
import EditorWorkspace from './components/EditorWorkspace';
import ProjectList from './components/ProjectList';
import PanelSettings from './components/PanelSettings';

function App() {
  return (
    <Layout
      leftPanel={<ProjectList />}
      centerPanel={<EditorWorkspace />}
      rightPanel={<PanelSettings />}
    />
  );
}

export default App;
