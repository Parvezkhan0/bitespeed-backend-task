import Contact from '../models/contact';
import { Op } from 'sequelize';

export const identifyContact = async (email?: string, phoneNumber?: string) => {
  // Find all contacts matching either email or phone
  const contacts = await Contact.findAll({
    where: {
      [Op.or]: [
        { email: email || null },
        { phoneNumber: phoneNumber || null }
      ]
    },
    order: [['createdAt', 'ASC']]
  });

  // Case 1: No existing contacts - create new primary
  if (contacts.length === 0) {
    const newPrimary = await Contact.create({ 
      email, 
      phoneNumber,
      linkPrecedence: 'primary'
    });
    
    return formatResponse(newPrimary, []);
  }

  // Check if exact match exists
  const exactMatch = contacts.find(
    c => c.email === email && c.phoneNumber === phoneNumber
  );

  // Get all primary contacts from results
  const primaryContacts = contacts.filter(c => c.linkPrecedence === 'primary');
  
  // Case 2: Multiple primary contacts found - need to merge
  if (primaryContacts.length > 1) {
    // Keep the oldest primary
    const oldestPrimary = primaryContacts[0];
    const primariesToDemote = primaryContacts.slice(1);

    // Demote newer primaries and update their secondary contacts
    for (const primaryToDemote of primariesToDemote) {
      // Update the primary itself
      primaryToDemote.linkPrecedence = 'secondary';
      primaryToDemote.linkedId = oldestPrimary.id;
      await primaryToDemote.save();

      // Find and update all secondary contacts linked to this demoted primary
      await Contact.update(
        { linkedId: oldestPrimary.id },
        { 
          where: { 
            linkedId: primaryToDemote.id 
          } 
        }
      );
    }

    // Fetch all contacts again after merge
    const allLinkedContacts = await Contact.findAll({
      where: {
        [Op.or]: [
          { id: oldestPrimary.id },
          { linkedId: oldestPrimary.id }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    // Check if we need to create a new secondary (new info not in exact match)
    if (!exactMatch) {
      const newSecondary = await Contact.create({
        email,
        phoneNumber,
        linkedId: oldestPrimary.id,
        linkPrecedence: 'secondary'
      });
      allLinkedContacts.push(newSecondary);
    }

    const secondaryContacts = allLinkedContacts.filter(c => c.id !== oldestPrimary.id);
    return formatResponse(oldestPrimary, secondaryContacts);
  }

  // Case 3: Single primary contact exists
  const primaryContact = primaryContacts[0];
  
  // If exact match doesn't exist and we have new information, create secondary
  if (!exactMatch) {
    const newSecondary = await Contact.create({
      email,
      phoneNumber,
      linkedId: primaryContact.id,
      linkPrecedence: 'secondary'
    });
    contacts.push(newSecondary);
  }

  // Get all secondary contacts
  const secondaryContacts = contacts.filter(c => c.id !== primaryContact.id);
  
  return formatResponse(primaryContact, secondaryContacts);
};

// Helper function to format the response
function formatResponse(primary: Contact, secondaries: Contact[]) {
  const emails: string[] = [];
  const phoneNumbers: string[] = [];
  
  // Add primary contact's data first
  if (primary.email) emails.push(primary.email);
  if (primary.phoneNumber) phoneNumbers.push(primary.phoneNumber);
  
  // Add secondary contacts' data
  for (const contact of secondaries) {
    if (contact.email && !emails.includes(contact.email)) {
      emails.push(contact.email);
    }
    if (contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
      phoneNumbers.push(contact.phoneNumber);
    }
  }
  
  return {
    contact: {
      primaryContactId: primary.id,
      emails,
      phoneNumbers,
      secondaryContactIds: secondaries.map(c => c.id)
    }
  };
}