import React from "react";

function Help() {
  return (
    <div
      className="p-6 space-y-4 rounded-md shadow"
      style={{
        backgroundColor: "var(--card)",
        color: "var(--card-foreground)",
      }}
    >
      <h2 className="text-xl font-bold">Help & Support</h2>
      <div>
        <p className="font-medium">Email:</p>
        <p>support@example.com</p>
      </div>
      <div>
        <p className="font-medium">Address:</p>
        <p>123 Example Street, City, Country</p>
      </div>
      <div>
        <p className="font-medium">Phone:</p>
        <p>+1 234 567 890</p>
      </div>
    </div>
  );
}

export default Help;
