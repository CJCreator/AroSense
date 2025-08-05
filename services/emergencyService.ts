import { supabase } from '../src/integrations/supabase/client';
import { validateUserId, sanitizeForLog } from '../utils/securityUtils';

interface EmergencyData {
  name: string;
  blood_type?: string;
  allergies?: string[];
  emergency_contacts?: Array<{ phone: string }>;
}

export const getEmergencyInfo = async (userId: string) => {
    if (!validateUserId(userId)) return null;
    
    const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userId)
        .eq('relationship_to_user', 'Self')
        .single();
    
    if (error) throw error;
    return data;
};

export const generateQRCode = (emergencyData: EmergencyData): string => {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${emergencyData.name}
TEL:${emergencyData.emergency_contacts?.[0]?.phone || ''}
NOTE:Blood Type: ${emergencyData.blood_type || 'Unknown'}, Allergies: ${emergencyData.allergies?.join(', ') || 'None'}
END:VCARD`;
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(vCardData)}`;
};