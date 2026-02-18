import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"

const firebaseConfig = 
{
    apiKey: "AIzaSyAZsBvyg9LV72Qv1_bwXKvISJ72rBRD4E8",
    authDomain: "basquet-al-dia.firebaseapp.com",
    projectId: "basquet-al-dia",
    storageBucket: "basquet-al-dia.firebasestorage.app",
    messagingSenderId: "31463533110",
    appId: "1:31463533110:web:edb2442f9403af8064c697",
    measurementId: "G-FLCRWB0RRP"
}

const app = initializeApp(firebaseConfig)
const dbFire = getFirestore(app)
const auth = getAuth(app)
const COLLECTION_NAME = "liga_nacional"

let db = { teams: [], matches: [] }
let tempImageBase64 = ""

window.login = () => 
{
    const email = document.getElementById('adminEmail').value
    const pass = document.getElementById('adminPass').value
    if(!email || !pass) return alert("Completa los datos")
    
    signInWithEmailAndPassword(auth, email, pass).catch(e => 
    {
        document.getElementById('loginError').style.display = 'block'
    })

}

window.logout = () => signOut(auth)

onAuthStateChanged(auth, (user) => 
{
    if (user) 
    {
        document.getElementById('login-overlay').classList.add('hidden')
        document.getElementById('app-container').classList.remove('hidden')
        loadDB()
    } 
    
    else 
    {
        document.getElementById('login-overlay').classList.remove('hidden')
        document.getElementById('app-container').classList.add('hidden')
    }

})

async function loadDB() 
{
    try 
    {
        const docRef = doc(dbFire, COLLECTION_NAME, "data_v1")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) db = docSnap.data()
        
        else 
        { 
            db = { teams: [], matches: [] } 
            saveDB();
        }

        updateUI()
        updateTeamSelects()
    } 
    
    catch(e) 
    { 
        console.error(e)
    }

}

async function saveDB() 
{
    try 
    {
        await setDoc(doc(dbFire, COLLECTION_NAME, "data_v1"), db)
        updateUI()
        updateTeamSelects()
    } 
    catch (e) 
    { 
        alert("Error al guardar: " + e.message)
    }
}

window.internalSaveDB = saveDB

window.processImage = (input) => 
{

    if (input.files && input.files[0]) 
    {

        const reader = new FileReader()

        reader.onload = function(e) 
        {
            const img = new Image()
            img.src = e.target.result

            img.onload = function() 
            {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                const MAX_SIZE = 150;
                let w = img.width, h = img.height

                if (w > h) 
                { 
                    if (w > MAX_SIZE) 
                    { 
                        h *= MAX_SIZE / w; w = MAX_SIZE 
                    } 
                } 
                else 
                { 
                    if (h > MAX_SIZE) 
                    { 
                        w *= MAX_SIZE / h; h = MAX_SIZE
                    } 
                }

                canvas.width = w; canvas.height = h
                ctx.clearRect(0, 0, w, h)
                ctx.drawImage(img, 0, 0, w, h)
                tempImageBase64 = canvas.toDataURL('image/png')
                document.getElementById('previewImg').src = tempImageBase64
                document.getElementById('teamLogoUrl').value = '';
            }
        }

        reader.readAsDataURL(input.files[0])

    }

}

window.updatePreviewFromUrl = (url) => { if(url) { document.getElementById('previewImg').src = url; tempImageBase64 = "" } }

window.addTeam = () => 
{
    const name = document.getElementById('teamName').value
    const code = document.getElementById('teamCode').value.toUpperCase()
    const logo = tempImageBase64 || document.getElementById('teamLogoUrl').value || "https://cdn-icons-png.flaticon.com/512/889/889455.png"
    if(!name || !code) return alert("Faltan datos")
    db.teams.push({ id: Date.now(), name, code, zone: "Unica", logo })
    window.internalSaveDB()
    document.getElementById('teamName').value = ''
    document.getElementById('teamCode').value = ''
    document.getElementById('previewImg').src = "https://cdn-icons-png.flaticon.com/512/889/889455.png"
    tempImageBase64 = ""
}

window.addMatch = () => 
{
    const round = document.getElementById('matchRound').value
    const home = document.getElementById('homeTeam').value
    const away = document.getElementById('awayTeam').value
    const homePts = document.getElementById('homeScore').value
    const awayPts = document.getElementById('awayScore').value
    const date = document.getElementById('matchDate').value
    const time = document.getElementById('matchTime').value
    const stadium = document.getElementById('matchStadium').value
    if(!home || !away || !date) return alert("Faltan datos")

    const match = 
    {
        id: Date.now(), zone: "Unica", round, home, away, 
        homePts: homePts === "" ? "-" : homePts, 
        awayPts: awayPts === "" ? "-" : awayPts,
        date, time, stadium
    }

    db.matches.push(match)
    window.internalSaveDB()
    document.getElementById('homeScore').value = ''
    document.getElementById('awayScore').value = ''

}

window.editTeam = (id) => 
{
    const t = db.teams.find(x => x.id === id)
    if(!t) return
    document.getElementById('teamName').value = t.name
    document.getElementById('teamCode').value = t.code || ''
    document.getElementById('previewImg').src = t.logo
    if(t.logo.startsWith('data:')) tempImageBase64 = t.logo
    window.deleteItem('team', id)
    document.getElementById('equipos').scrollIntoView({behavior: 'smooth'})
}

window.editMatch = (id) => 
{
    const m = db.matches.find(x => x.id === id)
    if(!m) return
    document.getElementById('matchRound').value = m.round
    document.getElementById('matchDate').value = m.date
    document.getElementById('matchTime').value = m.time
    document.getElementById('matchStadium').value = m.stadium
    document.getElementById('homeTeam').value = m.home
    document.getElementById('awayTeam').value = m.away
    document.getElementById('homeScore').value = m.homePts === '-' ? '' : m.homePts
    document.getElementById('awayScore').value = m.awayPts === '-' ? '' : m.awayPts
    window.deleteItem('match', id)
    document.getElementById('partidos').scrollIntoView({behavior: 'smooth'})
}

window.deleteItem = (type, id) => 
{
    if(type === 'team') db.teams = db.teams.filter(t => t.id !== id)
    if(type === 'match') db.matches = db.matches.filter(m => m.id !== id)
    window.internalSaveDB()
}

function updateTeamSelects() 
{
    const homeSelect = document.getElementById('homeTeam')
    const awaySelect = document.getElementById('awayTeam')
    if(!homeSelect) return
    let options = '<option value="">Seleccionar...</option>';
    [...db.teams].sort((a,b) => a.name.localeCompare(b.name)).forEach(t => options += `<option value="${t.name}">${t.name}</option>`)
    homeSelect.innerHTML = options;
    awaySelect.innerHTML = options;
}

function updateUI() 
{
    const tList = document.getElementById('teamList')

    if(tList) 
    {
        tList.innerHTML = ''

        db.teams.sort((a,b) => a.name.localeCompare(b.name)).forEach(t => 
        {
            tList.innerHTML += `
            <div class="list-item">
                <div class="info-box"><img src="${t.logo}" class="logo-mini"><div class="text-group"><span class="text-main">${t.name}</span><span class="text-code">${t.code}</span></div></div>
                <div class="actions-box"><button class="action-btn btn-edit" onclick="editTeam(${t.id})">✎</button><button class="action-btn btn-delete" onclick="deleteItem('team', ${t.id})">🗑️</button></div>
            </div>`
        })

    }

    const mList = document.getElementById('matchList')

    if(mList) 
    {
        mList.innerHTML = ''

        db.matches.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(m => 
        {
            mList.innerHTML += `
            <div class="list-item">
                <div class="info-box"><div class="text-group"><span class="text-main">${m.home} vs ${m.away}</span><span class="text-sub">${m.date} | ${m.round} | <b>${m.homePts} - ${m.awayPts}</b></span></div></div>
                <div class="actions-box"><button class="action-btn btn-edit" onclick="editMatch(${m.id})">✎</button><button class="action-btn btn-delete" onclick="deleteItem('match', ${m.id})">🗑️</button></div>
            </div>`
        })

    }

}

window.showTab = (id) => 
{
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
    document.getElementById(id).classList.add('active')
    event.target.classList.add('active')
}
window.clearDB = () => { if(confirm("¿BORRAR TODO?")) { db = { teams: [], matches: [] }; window.internalSaveDB(); } }
