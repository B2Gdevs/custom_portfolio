import { getAllContent } from '@/lib/content';
import ProjectsGrid from '@/components/projects/ProjectsGrid';
import ProjectsHeader from '@/components/projects/ProjectsHeader';

export default function ProjectsPage() {
  const projects = getAllContent('projects');

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <ProjectsHeader />
      </div>
      <div className="max-w-5xl mx-auto">
        <ProjectsGrid projects={projects} />
      </div>
    </div>
  );
}

