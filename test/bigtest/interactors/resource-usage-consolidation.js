import {
  interactor,
  isPresent,
} from '@bigtest/interactor';

import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';

import UsageConsolidationFilters from './usage-consolidation-filters';

export default @interactor class ResourceUsageConsolidation {
  accordion = new AccordionInteractor('#resourceShowUsageConsolidation');
  isAccordionPresent = isPresent('#resourceShowUsageConsolidation');

  filters = new UsageConsolidationFilters();

  whenLoaded() {
    return this.when(() => this.isAccordionPresent).timeout(1000);
  }
}
