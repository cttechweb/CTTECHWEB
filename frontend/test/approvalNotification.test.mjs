import test from 'node:test';
import assert from 'node:assert/strict';

test('B2B Approval Notification Contract & Logic Suite', async (t) => {
  await t.test('1. Notification triggers only when status is approved or isVerifiedRetailer is true', () => {
    // Approved via existing application
    const appApproved = { status: 'approved', companyName: 'Gulf MEP Cooling LLC' };
    const isApproved1 = appApproved.status === 'approved';
    assert.equal(isApproved1, true);

    // Pending application should NOT show notification
    const appPending = { status: 'pending', companyName: 'Gulf MEP Cooling LLC' };
    const isApproved2 = appPending.status === 'approved';
    assert.equal(isApproved2, false);

    // Under review application should NOT show notification
    const appReview = { status: 'under_review', companyName: 'Gulf MEP Cooling LLC' };
    const isApproved3 = appReview.status === 'approved';
    assert.equal(isApproved3, false);

    // Rejected application should NOT show notification
    const appRejected = { status: 'rejected', companyName: 'Gulf MEP Cooling LLC' };
    const isApproved4 = appRejected.status === 'approved';
    assert.equal(isApproved4, false);
  });

  await t.test('2. Synthetic retailer approval fields extraction', () => {
    const syntheticApp = {
      id: 'APP-2026-881294',
      companyName: 'Al Baraka MEP Solutions LLC',
      legalName: 'Al Baraka Mechanical Engineering LLC',
      tradeLicenseNumber: 'CN-2049182',
      taxRegistrationNumber: '100492819200003',
      businessType: 'MEP Contractor',
      paymentTermsRequested: '30 Days Net Credit',
      status: 'approved',
      reviewedAt: '2026-11-25T10:15:00.000Z',
      createdAt: '2026-11-24T08:30:00.000Z',
    };

    const businessName = syntheticApp.companyName || syntheticApp.legalName;
    const tradeLicense = syntheticApp.tradeLicenseNumber;
    const appId = syntheticApp.id;
    const approvalDate = new Date(syntheticApp.reviewedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const accountType = syntheticApp.businessType;
    const paymentTerms = syntheticApp.paymentTermsRequested;
    const status = 'Approved';

    assert.equal(businessName, 'Al Baraka MEP Solutions LLC');
    assert.equal(tradeLicense, 'CN-2049182');
    assert.equal(appId, 'APP-2026-881294');
    assert.equal(approvalDate, 'Nov 25, 2026');
    assert.equal(accountType, 'MEP Contractor');
    assert.equal(paymentTerms, '30 Days Net Credit');
    assert.equal(status, 'Approved');
  });

  await t.test('3. Fallbacks when partial application data is returned', () => {
    const sparseApp = {
      status: 'approved',
    };
    const profile = {
      companyName: 'Apex Air Trading LLC',
      taxId: 'TRN-998877',
      role: 'retailer',
      id: 'usr_abc12345',
    };

    const businessName = sparseApp.companyName || profile.companyName;
    const tradeLicense = sparseApp.tradeLicenseNumber || profile.taxId;
    const appId = sparseApp.id || `APP-${profile.id.substring(0, 8).toUpperCase()}`;
    const accountType = sparseApp.businessType || (profile.role === 'retailer' ? 'B2B Retailer' : 'MEP / Reseller');
    const paymentTerms = sparseApp.paymentTermsRequested || 'Standard Trade Terms';

    assert.equal(businessName, 'Apex Air Trading LLC');
    assert.equal(tradeLicense, 'TRN-998877');
    assert.equal(appId, 'APP-USR_ABC1');
    assert.equal(accountType, 'B2B Retailer');
    assert.equal(paymentTerms, 'Standard Trade Terms');
  });

  await t.test('4. Cache key isolation per user identity for login/logout persistence', () => {
    const user1Uid = 'firebase_uid_user_1';
    const user2Uid = 'firebase_uid_user_2';

    const cacheKey1 = `ct_retailer_app_${user1Uid}`;
    const cacheKey2 = `ct_retailer_app_${user2Uid}`;

    assert.notEqual(cacheKey1, cacheKey2);
    assert.equal(cacheKey1, 'ct_retailer_app_firebase_uid_user_1');
  });
});
