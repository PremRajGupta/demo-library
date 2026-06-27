import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

type ContactInfo = {
  phone: string;
  phoneRaw: string;
  email: string;
  address: string;
  whatsappMessage: string;
};

type ContactEditFormProps = {
  contact: ContactInfo;
  onContactChange: (field: keyof ContactInfo, value: string) => void;
  inputClass: string;
  labelClass: string;
};

export default function ContactEditForm({
  contact,
  onContactChange,
  inputClass,
  labelClass,
}: ContactEditFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            <Phone size={16} className="inline mr-2" />
            Phone (Display)
          </label>
          <input
            type="text"
            className={inputClass}
            value={contact.phone}
            onChange={(e) => onContactChange('phone', e.target.value)}
            placeholder="e.g., +91 9229186355"
          />
        </div>

        <div>
          <label className={labelClass}>
            <Phone size={16} className="inline mr-2" />
            WhatsApp Number (Digits Only)
          </label>
          <input
            type="text"
            className={inputClass}
            value={contact.phoneRaw}
            onChange={(e) => onContactChange('phoneRaw', e.target.value.replace(/\D/g, ''))}
            placeholder="e.g., 919229186355"
          />
        </div>

        <div>
          <label className={labelClass}>
            <Mail size={16} className="inline mr-2" />
            Email
          </label>
          <input
            type="email"
            className={inputClass}
            value={contact.email}
            onChange={(e) => onContactChange('email', e.target.value)}
            placeholder="e.g., galaxy.library@gmail.com"
          />
        </div>

        <div>
          <label className={labelClass}>
            <MapPin size={16} className="inline mr-2" />
            Address
          </label>
          <input
            type="text"
            className={inputClass}
            value={contact.address}
            onChange={(e) => onContactChange('address', e.target.value)}
            placeholder="e.g., DhiraBigha, Sugaon Road, Tehta, Jehanabad"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>
            <MessageCircle size={16} className="inline mr-2" />
            WhatsApp Message (Template)
          </label>
          <textarea
            className={`${inputClass} resize-none h-20`}
            value={contact.whatsappMessage}
            onChange={(e) => onContactChange('whatsappMessage', e.target.value)}
            placeholder="e.g., Hi, I would like to know more about admission and fees."
          />
          <p className="text-xs text-[#64748b] mt-1">This message will appear when users click WhatsApp button</p>
        </div>
      </div>
    </div>
  );
}
