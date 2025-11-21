# Phase 1 Frontend Testing Guide

## ✅ PHASE 1 COMPLETE - Ready to Test!

### What's Been Implemented:

1. **Backend:**
   - ✅ `gender` field added to UserProfile model
   - ✅ API endpoint accepts gender updates (`PUT /api/v1/memory/profile/{user_id}`)
   - ✅ Gender persists in database
   - ✅ Default value: `"not_set"`

2. **Frontend:**
   - ✅ Gender selection page at `/gender-selection`
   - ✅ Beautiful UI with 3 options (Male, Female, Other)
   - ✅ Login flow redirects to gender selection for new users
   - ✅ Existing users skip if gender already set
   - ✅ Gender stored in localStorage for quick access

---

## 🧪 How to Test Phase 1:

### Test 1: New User Flow

1. **Start Backend:**
   ```powershell
   cd C:\Users\Navinkumar\Downloads\Edgesoul\backend
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start Frontend:**
   ```powershell
   cd C:\Users\Navinkumar\Downloads\Edgesoul\frontend
   npm run dev
   ```

3. **Test New User Registration:**
   - Open browser: `http://localhost:3000`
   - Click "Get Started"
   - Click "Don't have an account? Register"
   - Fill in:
     - Username: `test_user_1`
     - Password: `password123`
     - Confirm Password: `password123`
   - Click "Create Account"
   - **EXPECTED:** Should redirect to `/gender-selection`

4. **Test Gender Selection:**
   - You should see 3 options: 👨 Male, 👩 Female, ⚧️ Other
   - Click one option (e.g., Male)
   - Click "Continue to Dashboard"
   - **EXPECTED:** 
     - Should save gender to backend
     - Should redirect to `/dashboard`
     - Gender should show in console: `edgesoul_gender: male`

5. **Test Gender Persistence:**
   - Logout
   - Login again with same username/password
   - **EXPECTED:** Should skip gender selection and go directly to dashboard

---

### Test 2: Existing User (Gender Not Set)

1. **Clear gender from profile:**
   - Open browser console (F12)
   - Run:
     ```javascript
     localStorage.removeItem('edgesoul_gender');
     ```

2. **Logout and login again**
   - **EXPECTED:** Should be redirected to `/gender-selection`

---

### Test 3: Manual Gender Selection Page

1. **Direct URL:**
   - Visit: `http://localhost:3000/gender-selection`
   - Should see the gender selection page
   - Try all 3 options

2. **Check backend update:**
   - Select a gender
   - Click Continue
   - Check backend logs - should see profile update

---

## ✅ Success Criteria:

- [ ] Gender selection page loads with 3 options
- [ ] Clicking an option highlights it
- [ ] Continue button is disabled until option selected
- [ ] Backend receives gender update (check logs)
- [ ] User redirected to dashboard after selection
- [ ] Gender persists (check by logging out and in again)
- [ ] Existing users with gender set skip the page

---

## 🐛 Troubleshooting:

**If gender selection page doesn't appear:**
- Check browser console for errors
- Verify backend is running on port 8000
- Check that profile API returns `gender: "not_set"`

**If gender doesn't persist:**
- Check backend logs for PUT request
- Verify localStorage has `edgesoul_gender`
- Check database/memory storage

**If redirects don't work:**
- Check browser console for router errors
- Verify Next.js is running properly
- Clear browser cache and try again

---

## 📊 What to Check:

1. **Browser Console:**
   ```
   localStorage.getItem('edgesoul_gender')
   // Should return: "male", "female", or "other"
   ```

2. **Backend Logs:**
   ```
   INFO: "PUT /api/v1/memory/profile/user_001 HTTP/1.1" 200 OK
   ```

3. **Network Tab:**
   - Should see PUT request to `/api/v1/memory/profile/...`
   - Body should contain: `{"gender": "male"}`

---

## 🎯 Next Steps (After Phase 1 Testing):

Once Phase 1 is confirmed working:
- ✅ Phase 2: UI Theming based on gender
- ✅ Phase 3: Bot personality adjustment

