// src/app/dashboard/components/ActivityList.tsx
"use client";

type Activity = {
  id: string;
  action: string;
};

export default function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
      <ul className="space-y-2 text-gray-700">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <li key={activity.id}>{activity.action}</li>
          ))
        ) : (
          <li className="text-gray-500">No recent activity</li>
        )}
      </ul>
    </section>
  );
}