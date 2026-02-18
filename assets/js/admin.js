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

let db = { teams: [], matches: [] }
let tempImageBase64 = ""

window.login = () => 
{
    const email = document.getElementById('adminEmail').value
    const pass = document.getElementById('adminPass').value
    if(!email || !pass) return;
    
    signInWithEmailAndPassword(auth, email, pass)
    .catch((error) => 
    {
        document.getElementById('loginError').style.display = 'block'
        console.error(error)
    })

}

window.logout = () => 
{
    signOut(auth)
}

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

        const docRef = doc(dbFire, "liga_federal", "data_v1")
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) 
        {
            db = docSnap.data()
        } 
        
        else 
        {
            db = { teams: [], matches: [] }
            saveDB()
        }

        updateUI()
    } 
    
    catch(e) 
    {
        console.error("Error cargando datos:", e)
    }

}

async function saveDB() 
{
    try 
    {
        await setDoc(doc(dbFire, "liga_federal", "data_v1"), db)
        updateUI()
        console.log("Sincronización con nube exitosa.")
    } 

    catch (e) 
    {
        alert("Error al guardar en la nube: " + e.message)
    }

}

window.internalSaveDB = saveDB

const structure = 
{ 
    "NEA": ["Unica"], 
    "NOA": ["Unica"], 
    "Sudeste": ["A", "B"], 
    "Sur": ["Unica"], 
    "Centro": ["A", "B"], 
    "Litoral": ["A", "B"], 
    "Metropolitana": ["A", "B", "C"] 
}

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
                if (w > h) { if (w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; } } 
                else { if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; } }
                canvas.width = w; canvas.height = h
                ctx.clearRect(0, 0, w, h)
                ctx.drawImage(img, 0, 0, w, h)
                tempImageBase64 = canvas.toDataURL('image/png')
                document.getElementById('previewImg').src = tempImageBase64
                document.getElementById('teamLogoUrl').value = ''
            }

        }

        reader.readAsDataURL(input.files[0])
    }

}

window.updatePreviewFromUrl = (url) => { if(url) { document.getElementById('previewImg').src = url; tempImageBase64 = ""; } }

window.updateZoneSelect = (confId, zoneId) => 
{

    const confSelect = document.getElementById(confId)
    const zoneSelect = document.getElementById(zoneId)
    const selectedConf = confSelect.value
    zoneSelect.innerHTML = '<option value="">Seleccionar...</option>'
    zoneSelect.disabled = true

    if(selectedConf && structure[selectedConf]) 
    {
        zoneSelect.disabled = false

        structure[selectedConf].forEach(z => {
            const opt = document.createElement('option')
            opt.value = z
            opt.textContent = z === "Unica" ? "Zona Única" : "Zona " + z
            zoneSelect.appendChild(opt)
        })

    }

    if(confId === 'matchConf') window.updateTeamSelects()

}

window.addTeam = () => 
{
    const name = document.getElementById('teamName').value
    const code = document.getElementById('teamCode').value.toUpperCase()
    const conf = document.getElementById('teamConf').value
    const zone = document.getElementById('teamZone').value
    const defaultLogo = "https://cdn-icons-png.flaticon.com/512/889/889455.png"
    const logo = tempImageBase64 || document.getElementById('teamLogoUrl').value || defaultLogo

    if(!name || !code || !conf || !zone) return alert("Faltan datos obligatorios")
    
    const fullZone = `${conf} ${zone}`
    db.teams.push({ id: Date.now(), name, code, zone: fullZone, logo })
    window.internalSaveDB()
    
    document.getElementById('teamName').value = ''
    document.getElementById('teamCode').value = ''
    document.getElementById('previewImg').src = defaultLogo
    tempImageBase64 = ""

}

window.editTeam = (id) => 
{
    const t = db.teams.find(x => x.id === id)
    if(!t) return
    const [conf, zone] = t.zone.split(' ')
    document.getElementById('teamName').value = t.name
    document.getElementById('teamCode').value = t.code || ''
    document.getElementById('teamConf').value = conf
    window.updateZoneSelect('teamConf', 'teamZone')
    document.getElementById('teamZone').value = zone
    document.getElementById('previewImg').src = t.logo
    if(t.logo.startsWith('data:')) tempImageBase64 = t.logo
    window.deleteItem('team', id);
    document.getElementById('equipos').scrollIntoView({behavior: 'smooth'})
}

window.updateTeamSelects = () => 
{
    const conf = document.getElementById('matchConf').value
    const zone = document.getElementById('matchZone').value
    const fullZone = `${conf} ${zone}`
    const homeSelect = document.getElementById('homeTeam')
    const awaySelect = document.getElementById('awayTeam')
    const zoneTeams = db.teams.filter(t => t.zone === fullZone)
    let options = '<option value="">Seleccionar...</option>'
    zoneTeams.forEach(t => options += `<option value="${t.name}">${t.name} (${t.code})</option>`)
    homeSelect.innerHTML = options
    awaySelect.innerHTML = options
}

window.addMatch = () => 
{
    const conf = document.getElementById('matchConf').value
    const zone = document.getElementById('matchZone').value
    const fullZone = `${conf} ${zone}`
    const round = document.getElementById('matchRound').value
    const home = document.getElementById('homeTeam').value
    const away = document.getElementById('awayTeam').value
    const homePts = document.getElementById('homeScore').value
    const awayPts = document.getElementById('awayScore').value
    const date = document.getElementById('matchDate').value
    const time = document.getElementById('matchTime').value
    const stadium = document.getElementById('matchStadium').value

    if(!home || !away || !date) return alert("Faltan datos del partido")

    const match = 
    {
        id: Date.now(),
        zone: fullZone, round, home, away, 
        homePts: homePts === "" ? "-" : homePts, 
        awayPts: awayPts === "" ? "-" : awayPts,
        date, time, stadium
    }

    db.matches.push(match)
    window.internalSaveDB()
    
    document.getElementById('homeScore').value = ''
    document.getElementById('awayScore').value = ''
}

window.editMatch = (id) => 
{
    const m = db.matches.find(x => x.id === id)
    if(!m) return
    const [conf, zone] = m.zone.split(' ')
    document.getElementById('matchConf').value = conf
    window.updateZoneSelect('matchConf', 'matchZone')
    document.getElementById('matchZone').value = zone
    window.updateTeamSelects();
    document.getElementById('matchRound').value = m.round
    document.getElementById('matchDate').value = m.date
    document.getElementById('matchTime').value = m.time
    document.getElementById('matchStadium').value = m.stadium
    document.getElementById('homeTeam').value = m.home
    document.getElementById('awayTeam').value = m.away
    document.getElementById('homeScore').value = m.homePts === '-' ? '' : m.homePts
    document.getElementById('awayScore').value = m.awayPts === '-' ? '' : m.awayPts
    window.deleteItem('match', id);
    document.getElementById('partidos').scrollIntoView({behavior: 'smooth'})
}

window.deleteItem = (type, id) => 
{
    if(type === 'team') db.teams = db.teams.filter(t => t.id !== id)
    if(type === 'match') db.matches = db.matches.filter(m => m.id !== id)
    window.internalSaveDB()
}

function updateUI() 
{

    const tList = document.getElementById('teamList')
    tList.innerHTML = ''
    db.teams.sort((a,b) => a.zone.localeCompare(b.zone))

    db.teams.forEach(t => {
        tList.innerHTML += `
        <div class="list-item">
            <div class="info-box">
                <img src="${t.logo}" class="logo-mini">
                <div class="text-group">
                    <span class="text-main">${t.name}</span>
                    <span class="text-code">${t.code}</span>
                    <span class="text-zone">${t.zone}</span>
                </div>
            </div>
            <div class="actions-box">
                <button class="action-btn btn-edit" onclick="editTeam(${t.id})" title="Editar">✎</button>
                <button class="action-btn btn-delete" onclick="deleteItem('team', ${t.id})" title="Borrar">🗑️</button>
            </div>
        </div>`

    })

    const mList = document.getElementById('matchList')
    mList.innerHTML = ''
    db.matches.sort((a,b) => new Date(b.date) - new Date(a.date))

    db.matches.forEach(m => {
        mList.innerHTML += `
        <div class="list-item">
            <div class="info-box">
                <div class="text-group">
                    <span class="text-zone">${m.zone}</span>
                    <span class="text-main" style="margin-top:2px;">${m.home} vs ${m.away}</span>
                    <span class="text-sub" style="margin-top:2px;">${m.date} | ${m.round} | <b>${m.homePts} - ${m.awayPts}</b></span>
                </div>
            </div>
            <div class="actions-box">
                <button class="action-btn btn-edit" onclick="editMatch(${m.id})" title="Editar">✎</button>
                <button class="action-btn btn-delete" onclick="deleteItem('match', ${m.id})" title="Borrar">🗑️</button>
            </div>
        </div>`

    })

}

window.showTab = (id) => 
{
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
    document.getElementById(id).classList.add('active')
    event.target.classList.add('active')
}

window.clearDB = () => 
{

    if(confirm("¿BORRAR TODA LA BASE DE DATOS EN LA NUBE?")) 
    {
        db = { teams: [], matches: [] }
        window.internalSaveDB()
    }

}
