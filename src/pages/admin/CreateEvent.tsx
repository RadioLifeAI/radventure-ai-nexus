
import React from "react";
import { CreateEventForm } from "./components/CreateEventForm";

export default function CreateEvent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <CreateEventForm />
      </div>
    </div>
  );
}
