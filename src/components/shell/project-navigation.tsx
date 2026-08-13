"use client";

import { useState } from "react";

import { Select } from "../ui/select";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export type ProjectSection = Readonly<{ value: string; label: string }>;

export function ProjectNavigationShell({
  sections,
  initialSection,
  audience,
}: Readonly<{
  sections: readonly ProjectSection[];
  initialSection: string;
  audience: "agency" | "client";
}>) {
  const [value, setValue] = useState(initialSection);
  return (
    <div
      className="project-tabs-shell"
      data-agency-project={audience === "agency"}
    >
      <Tabs value={value} onValueChange={setValue}>
        <TabsList aria-label="Project sections">
          {sections.map((section) => (
            <TabsTrigger key={section.value} value={section.value}>
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {audience === "agency" ? (
        <div className="project-mobile-switcher">
          <Select
            ariaLabel="Project section"
            items={sections}
            value={value}
            onValueChange={setValue}
          />
        </div>
      ) : null}
    </div>
  );
}
