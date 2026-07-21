(function () {
  'use strict';

  /* ---------- TLP date ---------- */
  var dateEl = document.getElementById('tlp-date');
  if (dateEl) {
    var d = new Date();
    dateEl.textContent = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Hero terminal typewriter (signature moment, runs once) ---------- */
  var terminalBody = document.getElementById('terminalBody');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var script = [
    { type: 'prompt', text: '$ whoami' },
    { type: 'result', text: 'SDS_Mewan — 1st year student, aspiring security engineer' },
    { type: 'prompt', text: '$ scan --target career_goals --focus' },
    { type: 'result', text: '[+] network defense' },
    { type: 'result', text: '[+] penetration testing' },
    { type: 'result', text: '[+] secure application development' },
    { type: 'prompt', text: '$ status' },
    { type: 'result', text: '[✓] open to opportunities' }
  ];

  function typeLine(container, text, className, speed, done) {
    var span = document.createElement('span');
    span.className = 'line ' + className;
    container.appendChild(span);
    if (reducedMotion) {
      span.textContent = text;
      done();
      return;
    }
    var i = 0;
    (function step() {
      span.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        setTimeout(step, speed);
      } else {
        done();
      }
    })();
  }

  function runScript(container, lines, idx) {
    idx = idx || 0;
    if (idx >= lines.length) return;
    var line = lines[idx];
    var speed = line.type === 'prompt' ? 34 : 14;
    var pause = line.type === 'prompt' ? 220 : 320;
    typeLine(container, line.text, line.type, speed, function () {
      setTimeout(function () { runScript(container, lines, idx + 1); }, pause);
    });
  }

  if (terminalBody) {
    if ('IntersectionObserver' in window) {
      var started = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !started) {
            started = true;
            runScript(terminalBody, script);
            io.disconnect();
          }
        });
      }, { threshold: 0.3 });
      io.observe(terminalBody);
    } else {
      runScript(terminalBody, script);
    }
  }

  /* ---------- Scroll reveal for section cards ---------- */
  var revealTargets = document.querySelectorAll(
    '.finding-card, .tool-card, .note-card, .writeup, .edu-card'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Contact form: client-side validation & sanitization ----------
     NOTE: This is a static site with no backend. Validation here improves UX
     and demonstrates secure-input handling, but it is NOT a substitute for
     server-side validation. See "Technical Notes" section on the page.
  ------------------------------------------------------------------------ */
  var form = document.getElementById('contactForm');
  if (form) {
    var fields = {
      name: { input: document.getElementById('cf-name'), err: document.getElementById('err-name') },
      email: { input: document.getElementById('cf-email'), err: document.getElementById('err-email') },
      message: { input: document.getElementById('cf-message'), err: document.getElementById('err-message') }
    };
    var formNote = document.getElementById('formNote');

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function setError(field, msg) {
      var row = fields[field].input.closest('.form-row');
      fields[field].err.textContent = msg || '';
      row.classList.toggle('invalid', !!msg);
    }

    function validate() {
      var ok = true;
      var name = fields.name.input.value.trim();
      var email = fields.email.input.value.trim();
      var message = fields.message.input.value.trim();

      if (name.length < 2 || name.length > 80) {
        setError('name', 'Enter a name between 2 and 80 characters.');
        ok = false;
      } else {
        setError('name', '');
      }

      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email) || email.length > 120) {
        setError('email', 'Enter a valid email address.');
        ok = false;
      } else {
        setError('email', '');
      }

      if (message.length < 10 || message.length > 1000) {
        setError('message', 'Message should be 10–1000 characters.');
        ok = false;
      } else {
        setError('message', '');
      }

      return ok;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      formNote.textContent = '';

      if (!validate()) {
        formNote.textContent = 'Please fix the highlighted fields.';
        return;
      }

      // Sanitize (escape) before doing anything with the values client-side.
      var safeName = escapeHtml(fields.name.input.value.trim());
      var safeMessage = escapeHtml(fields.message.input.value.trim());
      void safeName; void safeMessage; // demonstration only — no DOM injection performed

      // No backend is wired up on this static site. Fall back to a mailto
      // draft so the form is still functionally useful, and say so plainly.
      var subject = encodeURIComponent('Portfolio contact from ' + fields.name.input.value.trim());
      var body = encodeURIComponent(fields.message.input.value.trim() + '\n\n— ' + fields.email.input.value.trim());
      formNote.textContent = 'Opening your email client to send this message...';
      window.location.href = 'mailto:you@example.com?subject=' + subject + '&body=' + body;
      form.reset();
    });

    Object.keys(fields).forEach(function (key) {
      fields[key].input.addEventListener('blur', validate);
    });
  }

  /* ---------- FAQ chatbot: simple keyword-matched, no external API ---------- */
  var faqData = [
    {
      keywords: ['tool', 'tools', 'software', 'stack'],
      answer: 'My core toolset includes Nmap, Wireshark, and Burp Suite, plus Linux/Bash, Git, SQL, and Java/Spring Boot for building secure applications. See the "Toolset" section for the full list.'
    },
    {
      keywords: ['ctf', 'capture the flag', 'competition'],
      answer: 'I take part in CTF competitions and post sanitized methodology write-ups (no flags or exploit details) under the "CTF Write-ups" section.'
    },
    {
      keywords: ['project', 'projects', 'lab', 'labs', 'build', 'built'],
      answer: 'My featured project is a Spring Boot hospital management system demonstrating layered architecture and secure application design. More labs are listed under "Findings".'
    },
    {
      keywords: ['study', 'education', 'university', 'degree', 'module', 'course'],
      answer: 'I\'m studying Cyber Security, currently working through modules covering object-oriented programming, professional practice, and network security. Details are in the "Education" section.'
    },
    {
      keywords: ['contact', 'email', 'reach', 'hire', 'linkedin', 'github'],
      answer: 'You can reach me through the contact form, or find my GitHub and LinkedIn links in the "Contact" section at the bottom of the page.'
    },
    {
      keywords: ['cv', 'resume'],
      answer: 'You can download my CV as a PDF using the button near the top of the page.'
    },
    {
      keywords: ['secure', 'security', 'safe', 'attack surface'],
      answer: 'This site is intentionally built as a static site with no database, minimal dependencies, and client-side input validation on the contact form. See "Technical Notes" for the full breakdown.'
    },
    {
      keywords: ['who are you', 'about you', 'who is', 'introduce'],
      answer: 'I\'m SDS_Mewan, a first-year Cyber Security student aiming to become a Security Engineer, focused on network defense, secure application design, and hands-on lab work. Check the "Executive Summary" section for more.'
    }
  ];

  var fallbackAnswer = 'I don\'t have an answer for that yet — try asking about my tools, projects, CTF write-ups, education, or how to get in touch.';

  var suggestions = ['What tools do you use?', 'Tell me about your projects', 'How can I contact you?'];

  var chatToggle = document.getElementById('chatToggle');
  var chatPanel = document.getElementById('chatPanel');
  var chatClose = document.getElementById('chatClose');
  var chatLog = document.getElementById('chatLog');
  var chatForm = document.getElementById('chatForm');
  var chatInput = document.getElementById('chatInput');
  var chatSuggestions = document.getElementById('chatSuggestions');

  function addMessage(text, who) {
    var msg = document.createElement('div');
    msg.className = 'chat-msg ' + who;
    msg.textContent = text; // textContent only — never innerHTML with user input
    chatLog.appendChild(msg);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function answerFor(query) {
    var q = query.toLowerCase();
    for (var i = 0; i < faqData.length; i++) {
      var entry = faqData[i];
      for (var j = 0; j < entry.keywords.length; j++) {
        if (q.indexOf(entry.keywords[j]) !== -1) return entry.answer;
      }
    }
    return fallbackAnswer;
  }

  function renderSuggestions() {
    chatSuggestions.innerHTML = '';
    suggestions.forEach(function (s) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = s;
      chip.addEventListener('click', function () { handleQuery(s); });
      chatSuggestions.appendChild(chip);
    });
  }

  function handleQuery(text) {
    var trimmed = text.trim();
    if (!trimmed) return;
    addMessage(trimmed, 'user');
    var reply = answerFor(trimmed);
    setTimeout(function () { addMessage(reply, 'bot'); }, 300);
  }

  if (chatToggle && chatPanel) {
    var chatOpened = false;
    chatToggle.addEventListener('click', function () {
      var isHidden = chatPanel.hasAttribute('hidden');
      if (isHidden) {
        chatPanel.removeAttribute('hidden');
        if (!chatOpened) {
          chatOpened = true;
          addMessage('Hi — ask me about my tools, projects, or how to get in touch.', 'bot');
          renderSuggestions();
        }
        chatInput.focus();
      } else {
        chatPanel.setAttribute('hidden', '');
      }
    });
    chatClose.addEventListener('click', function () { chatPanel.setAttribute('hidden', ''); });
  }

  if (chatForm) {
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleQuery(chatInput.value);
      chatInput.value = '';
    });
  }
})();
