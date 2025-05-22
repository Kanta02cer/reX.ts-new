"use client";
import { useState } from "react";

type FormData = {
  requirements: string;
  company: string;
  sender: string;
  position: string;
};

type RequirementsFormProps = {
  onFormChange: (data: FormData) => void;
  initialData?: FormData;
  isSubmitting?: boolean;
};

export default function RequirementsForm({ 
  onFormChange, 
  initialData = { requirements: "", company: "", sender: "", position: "" },
  isSubmitting = false
}: RequirementsFormProps) {
  const [formData, setFormData] = useState<FormData>(initialData);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    onFormChange(updatedData);
  }

  function handleReset() {
    const resetData = {
      requirements: "",
      company: "",
      sender: "",
      position: ""
    };
    setFormData(resetData);
    onFormChange(resetData);
  }

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">企業要件</h3>
          <button
            onClick={handleReset}
            disabled={isSubmitting}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            リセット
          </button>
        </div>
        <div className="p-4">
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="求めるスキルや経験、企業文化などの要件を入力してください"
            className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gray-50 p-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">スカウト担当者名</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              会社名
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="株式会社〇〇"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sender" className="block text-sm font-medium text-gray-700 mb-1">
                担当者名
              </label>
              <input
                type="text"
                id="sender"
                name="sender"
                value={formData.sender}
                onChange={handleChange}
                placeholder="山田太郎"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                役職
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="採用担当"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 