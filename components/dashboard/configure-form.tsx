"use client"

interface ConfigureFormProps {
  userId: string
}

export function ConfigureForm({ userId }: ConfigureFormProps) {
  // This component is now simplified - it only renders alongside Your Persona section
  // The Writing Template and Test Post Generation features have been moved to the Templates page
  
  return (
    <div className="space-y-6">
      {/* This component is now a placeholder */}
      {/* Your Persona section is displayed above this component in the Configure page */}
      {/* For template management, users should navigate to the Templates page */}
    </div>
  )
}
