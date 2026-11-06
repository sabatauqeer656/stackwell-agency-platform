import ChoiceCardGroup from '../ChoiceCardGroup.jsx';
import { budgetRanges, timelines } from '../../../features/quotes/quoteOptions.js';

// Step 2: how much and how soon. Both are only guidance: "Not sure yet" and "Flexible" are fine answers.
export default function BudgetStep({ register, errors }) {
  return (
    <div className="space-y-8">
      <ChoiceCardGroup
        legend="What is your budget?"
        hint="A rough range helps us suggest the right approach. It is not a commitment."
        name="budgetRange"
        options={budgetRanges}
        register={register}
        error={errors.budgetRange?.message}
      />
      <ChoiceCardGroup
        legend="When would you like to start?"
        name="timeline"
        options={timelines}
        register={register}
        error={errors.timeline?.message}
        columns="sm:grid-cols-3"
      />
    </div>
  );
}
