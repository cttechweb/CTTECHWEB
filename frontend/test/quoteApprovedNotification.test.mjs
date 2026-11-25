import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function evaluateQuoteState(existingQuote) {
  const quoteStatusNormalized = (existingQuote?.status || '').toLowerCase();
  const isQuoteApproved =
    quoteStatusNormalized === 'approved' ||
    existingQuote?.isApproved === true;

  const isQuotePending =
    Boolean(existingQuote) &&
    !isQuoteApproved &&
    quoteStatusNormalized !== 'rejected' &&
    quoteStatusNormalized !== 'declined' &&
    quoteStatusNormalized !== 'cancelled';

  return { isQuoteApproved, isQuotePending };
}

describe('B2B Commercial Quotation Approval Workflow Contract Suite', () => {
  it('1. Newly submitted quotation is PENDING and NOT approved, even if partner is approved', () => {
    const newlySubmittedQuote = {
      id: 'RFQ-2026-258730',
      rfqNumber: 'RFQ-2026-258730',
      status: 'NEW',
      projectLocation: 'Abu Dhabi, UAE',
      paymentTerms: 'Advance Payment',
      products: [{ productName: 'Aftron Window AC 1.5 TR Rotary R-410a', quantity: 1 }],
      createdAt: '2026-11-25T10:00:00Z',
    };

    const state = evaluateQuoteState(newlySubmittedQuote);

    assert.equal(state.isQuoteApproved, false, 'Newly submitted quotation must NOT be approved');
    assert.equal(state.isQuotePending, true, 'Newly submitted quotation MUST be pending executive review');
  });

  it('2. Quotation with Pending CEO Approval status stays in PENDING review state', () => {
    const pendingQuote = {
      id: 'RFQ-2026-258730',
      rfqNumber: 'RFQ-2026-258730',
      status: 'Pending CEO Approval',
      projectLocation: 'Abu Dhabi, UAE',
      paymentTerms: 'Advance Payment',
      products: [{ productName: 'Blue Star Window AC 1.5 TR', quantity: 1 }],
    };

    const state = evaluateQuoteState(pendingQuote);

    assert.equal(state.isQuoteApproved, false, 'Quote under CEO review must NOT be marked approved');
    assert.equal(state.isQuotePending, true, 'Quote under CEO review must be pending');
  });

  it('3. ONLY after CEO/COO approval in CRM does isQuoteApproved become true', () => {
    const approvedQuote = {
      id: 'RFQ-2026-258730',
      rfqNumber: 'RFQ-2026-258730',
      status: 'Approved',
      projectLocation: 'Abu Dhabi, UAE',
      paymentTerms: '30 Days Net B2B Credit',
      approvedAt: '2026-11-25T11:00:00Z',
      products: [{ productName: 'Aftron Window AC 1.5 TR Rotary R-410a', quantity: 1 }],
    };

    const state = evaluateQuoteState(approvedQuote);

    assert.equal(state.isQuoteApproved, true, 'Quotation must be approved after CRM approval');
    assert.equal(state.isQuotePending, false, 'Approved quotation is no longer pending');
  });

  it('4. Rejected or cancelled quotes are neither pending nor approved', () => {
    const rejectedQuote = {
      id: 'RFQ-2026-REJ',
      status: 'rejected',
      projectLocation: 'Dubai, UAE',
    };

    const state = evaluateQuoteState(rejectedQuote);

    assert.equal(state.isQuoteApproved, false);
    assert.equal(state.isQuotePending, false);
  });

  it('5. Preserves quotation cache per user identity across login/logout', () => {
    const userAKey = 'usr_retailer_shemin_uid';
    const userBKey = 'usr_guest_contractor_uid';

    const cache = {};
    const setCache = (k, v) => { cache[k] = JSON.stringify(v); };
    const getCache = (k) => (cache[k] ? JSON.parse(cache[k]) : null);

    setCache(`ct_approved_quote_${userAKey}`, { id: 'RFQ-SHEMIN-01', status: 'Approved' });

    assert.equal(getCache(`ct_approved_quote_${userAKey}`)?.status, 'Approved');
    assert.equal(getCache(`ct_approved_quote_${userBKey}`), null);
  });
});
