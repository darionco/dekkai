(module
  (type (;0;) (func (param i32)))
  (import "env" "memory" (memory (;0;) 1 16384))
  (func (;0;) (type 0) (param i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    local.get 0
    i32.load
    local.set 3
    local.get 0
    i32.load offset=16
    local.set 1
    local.get 0
    i32.load offset=4
    local.tee 4
    i32.const 0
    i32.le_s
    if  ;; label = @1
      local.get 0
      i32.const 0
      i32.store offset=24
      local.get 0
      i32.const 0
      i32.store offset=28
      local.get 0
      i32.const -1
      i32.store offset=32
      local.get 0
      i32.const 0
      i32.store offset=36
      return
    end
    local.get 3
    local.get 4
    i32.add
    local.set 9
    local.get 1
    i32.const 255
    i32.and
    local.set 10
    local.get 0
    i32.load offset=12
    i32.const 255
    i32.and
    local.set 11
    local.get 1
    i32.const 255
    i32.and
    local.set 12
    local.get 0
    i32.load offset=8
    i32.const 255
    i32.and
    local.set 13
    i32.const 0
    local.set 1
    i32.const -1
    local.set 4
    loop  ;; label = @1
      local.get 2
      i32.const 1
      i32.add
      local.set 2
      local.get 10
      local.get 3
      i32.load8_u
      local.tee 6
      i32.eq
      if  ;; label = @2
        block  ;; label = @3
          local.get 3
          i32.const 1
          i32.add
          local.tee 6
          local.get 9
          i32.lt_u
          if  ;; label = @4
            local.get 12
            local.get 6
            i32.load8_u
            i32.eq
            if  ;; label = @5
              local.get 6
              local.set 3
              br 2 (;@3;)
            end
          end
          local.get 5
          i32.eqz
          local.set 5
        end
      else
        local.get 5
        i32.const 0
        i32.ne
        local.tee 14
        local.get 6
        local.get 11
        i32.ne
        i32.or
        if  ;; label = @3
          local.get 6
          local.get 13
          i32.eq
          if  ;; label = @4
            i32.const 0
            local.set 5
            local.get 1
            local.get 2
            local.get 1
            local.get 2
            i32.gt_u
            select
            local.set 1
            local.get 4
            local.get 2
            local.get 4
            local.get 2
            i32.lt_u
            select
            local.set 4
            i32.const 0
            local.set 2
            local.get 7
            i32.const 1
            i32.add
            local.set 7
            local.get 8
            local.get 14
            i32.add
            local.set 8
          end
        else
          i32.const 0
          local.set 5
        end
      end
      local.get 3
      i32.const 1
      i32.add
      local.tee 3
      local.get 9
      i32.lt_u
      br_if 0 (;@1;)
    end
    local.get 0
    local.get 7
    i32.store offset=24
    local.get 0
    local.get 8
    i32.store offset=28
    local.get 0
    local.get 4
    i32.store offset=32
    local.get 0
    local.get 1
    i32.store offset=36)
  (func (;1;) (type 0) (param i32)
    (local i32 i32 i32 i32 i32 i32)
    local.get 0
    i32.load
    local.set 6
    local.get 0
    i32.load offset=12
    local.set 2
    local.get 0
    i32.load offset=8
    local.tee 3
    local.get 0
    i32.load offset=4
    local.tee 4
    i32.lt_u
    if (result i32)  ;; label = @1
      block (result i32)  ;; label = @2
        local.get 2
        i32.const 255
        i32.and
        local.set 5
        local.get 3
        local.set 1
        loop  ;; label = @3
          local.get 5
          local.get 1
          local.get 6
          i32.add
          i32.load8_u
          i32.ne
          if  ;; label = @4
            local.get 1
            i32.const 1
            i32.add
            local.tee 1
            local.get 4
            i32.lt_u
            if  ;; label = @5
              br 2 (;@3;)
            else
              i32.const 0
              br 3 (;@2;)
            end
            unreachable
          end
        end
        local.get 1
        i32.const 1
        local.get 3
        i32.sub
        i32.add
      end
    else
      i32.const 0
    end
    local.set 4
    local.get 3
    i32.const 0
    i32.gt_s
    if (result i32)  ;; label = @1
      block (result i32)  ;; label = @2
        local.get 2
        i32.const 255
        i32.and
        local.set 5
        local.get 3
        local.set 1
        loop  ;; label = @3
          local.get 5
          local.get 1
          i32.const -1
          i32.add
          local.tee 2
          local.get 6
          i32.add
          i32.load8_u
          i32.ne
          if  ;; label = @4
            local.get 1
            i32.const 1
            i32.gt_s
            if  ;; label = @5
              local.get 2
              local.set 1
              br 2 (;@3;)
            else
              i32.const 0
              br 3 (;@2;)
            end
            unreachable
          end
        end
        local.get 2
        i32.const 1
        local.get 3
        i32.sub
        i32.add
      end
    else
      i32.const 0
    end
    local.tee 1
    local.get 4
    i32.or
    i32.eqz
    if  ;; label = @1
      local.get 0
      i32.const 0
      i32.store offset=16
      return
    end
    local.get 1
    local.get 4
    local.get 4
    i32.eqz
    local.tee 3
    select
    local.set 2
    local.get 1
    i32.eqz
    local.get 3
    i32.or
    if  ;; label = @1
      local.get 0
      local.get 2
      i32.store offset=16
      return
    end
    local.get 0
    local.get 4
    local.get 1
    local.get 4
    local.get 1
    i32.const 0
    local.get 1
    i32.sub
    local.get 1
    i32.const -1
    i32.gt_s
    select
    i32.lt_s
    select
    i32.store offset=16)
  (export "_analyzeBuffer" (func 0))
  (export "_findClosestLineBreak" (func 1)))
