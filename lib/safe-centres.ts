export type Centre = {
  name: string;
  type: string;
  town: string;
  district: string;
  phone: string;
  capacity: number;
  occupancy: number;
};

export const SAFE_CENTRES: Centre[] = [
  ["Ratnapura Town Hall", "Town hall", "Ratnapura", "Ratnapura", "0452222271", 240, 210],
  ["Kalu Ganga Community Hall", "Community hall", "Kalutara", "Kalutara", "0342222272", 180, 180],
  ["Kegalle District Secretariat", "Government building", "Kegalle", "Kegalle", "0352222273", 160, 92],
  ["Aranayake Maha Vidyalaya", "School", "Aranayake", "Kegalle", "0352265274", 120, 67],
  ["Kelaniya Temple Hall", "Religious centre", "Kelaniya", "Gampaha", "0112915275", 200, 144],
  ["Colombo Central College", "School", "Colombo", "Colombo", "0112695276", 300, 300],
  ["Kalutara South Youth Centre", "Community hall", "Kalutara", "Kalutara", "0342235277", 100, 38],
  ["Galle Municipal Hall", "Town hall", "Galle", "Galle", "0912235278", 220, 81],
  ["Matara Rahula College", "School", "Matara", "Matara", "0412235279", 190, 122],
  ["Kandy Red Cross Centre", "Relief centre", "Kandy", "Kandy", "0812235280", 150, 72],
  ["Nuwara Eliya Indoor Stadium", "Sports facility", "Nuwara Eliya", "Nuwara Eliya", "0522235281", 280, 256],
  ["Badulla District Hall", "Government building", "Badulla", "Badulla", "0552235282", 175, 101],
  ["Batticaloa Hindu College", "School", "Batticaloa", "Batticaloa", "0652235283", 210, 65],
  ["Ampara Community Centre", "Community hall", "Ampara", "Ampara", "0632235284", 130, 44],
  ["Kurunegala Youth Hall", "Community hall", "Kurunegala", "Kurunegala", "0372235285", 145, 88],
  ["Anuradhapura Public Hall", "Town hall", "Anuradhapura", "Anuradhapura", "0252235286", 250, 250],
].map((row) => ({
  name: row[0] as string,
  type: row[1] as string,
  town: row[2] as string,
  district: row[3] as string,
  phone: row[4] as string,
  capacity: row[5] as number,
  occupancy: row[6] as number,
}));
