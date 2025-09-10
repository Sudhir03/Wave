import { AccountForm } from "@/components/organisms/AccountForm";
import React from "react";

function Account() {
  return (
    <div className="w-full flex justify-center px-6">
      <div className="w-full max-w-md">
        <AccountForm />
      </div>
    </div>
  );
}

export default Account;
