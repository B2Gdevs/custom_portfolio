'use client';

// This layout removes the portfolio Nav and footer for the dialogue editor
// The editor needs full-screen real estate without layout constraints
export default function DialogueForgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {children}
    </div>
  );
}


