import SolutionCard from './SolutionCard.jsx';

export default function SolutionsGrid({ solutions }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {solutions.map((solution) => (
        <li key={solution._id} className="flex">
          <SolutionCard solution={solution} />
        </li>
      ))}
    </ul>
  );
}
