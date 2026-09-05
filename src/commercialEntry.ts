// Static import preserves the production entry bundle and its Maps preflight.
// This branch has no dependency on the unpublished floor-plan pilot.
import './main.ts';
import './commercialGrowth.css';
import { installCommercialGrowth } from './commercialGrowth.ts';
installCommercialGrowth();
